import * as ESTree from 'estree';
import {extname, basename} from 'path';
import {Rule} from 'eslint';

export interface BabelDecorator extends ESTree.BaseNode {
  type: 'Decorator';
  expression: ESTree.Expression;
}

export interface BabelProperty extends ESTree.MethodDefinition {
  decorators?: BabelDecorator[];
}

/**
 * Get the name of a node
 *
 * @param {ESTree.Node} node Node to retrieve name of
 * @return {?string}
 */
export function getIdentifierName(node: ESTree.Node): string | undefined {
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'Literal') {
    return node.raw;
  }
  return undefined;
}

export interface PropertyMapEntry {
  expr: ESTree.ObjectExpression | null;
  state: boolean;
  attribute: boolean;
}

/**
 * Extracts property metadata from a given property object
 * @param {ESTree.ObjectExpression} node Node to extract from
 * @return {object}
 */
export function extractPropertyEntry(
  node: ESTree.ObjectExpression
): PropertyMapEntry {
  let state = false;
  let attribute = true;

  for (const prop of node.properties) {
    if (
      prop.type === 'Property' &&
      prop.key.type === 'Identifier' &&
      prop.value.type === 'Literal'
    ) {
      if (prop.key.name === 'state' && prop.value.value === true) {
        state = true;
      } else if (prop.key.name === 'attribute' && prop.value.value === false) {
        attribute = false;
      }
    }
  }

  return {
    expr: node,
    state,
    attribute
  };
}

/**
 * Get the properties object of an element class
 *
 * @param {ESTree.Class} node Class to retrieve map from
 * @return {ReadonlyMap<string, ESTreeObjectExpression>}
 */
export function getPropertyMap(
  node: ESTree.Class
): ReadonlyMap<string, PropertyMapEntry> {
  const result = new Map<string, PropertyMapEntry>();
  const propertyDecorators = ['state', 'property', 'internalProperty'];
  const internalDecorators = ['state', 'internalProperty'];

  for (const member of node.body.body) {
    if (
      member.static &&
      member.kind === 'get' &&
      member.key.type === 'Identifier' &&
      member.key.name === 'properties' &&
      member.value.body
    ) {
      const ret = member.value.body.body.find(
        (m): boolean =>
          m.type === 'ReturnStatement' &&
          m.argument?.type === 'ObjectExpression'
      ) as ESTree.ReturnStatement;
      if (ret) {
        const arg = ret.argument as ESTree.ObjectExpression;
        for (const prop of arg.properties) {
          if (prop.type === 'Property') {
            const name = getIdentifierName(prop.key);

            if (name && prop.value.type === 'ObjectExpression') {
              result.set(name, extractPropertyEntry(prop.value));
            }
          }
        }
      }
    }

    const babelProp = member as BabelProperty;
    const memberName = getIdentifierName(member.key);

    if (memberName && babelProp.decorators) {
      for (const decorator of babelProp.decorators) {
        if (
          decorator.expression.type === 'CallExpression' &&
          decorator.expression.callee.type === 'Identifier' &&
          propertyDecorators.includes(decorator.expression.callee.name)
        ) {
          const dArg = decorator.expression.arguments[0];
          if (dArg?.type === 'ObjectExpression') {
            const state = internalDecorators.includes(
              decorator.expression.callee.name
            );
            const entry = extractPropertyEntry(dArg);
            if (state) {
              entry.state = true;
            }
            result.set(memberName, entry);
          } else {
            const state = internalDecorators.includes(
              decorator.expression.callee.name
            );
            result.set(memberName, {expr: null, state, attribute: true});
          }
        }
      }
    }
  }

  return result;
}

/**
 * Generates a placeholder string for a given quasi
 *
 * @param {ESTree.TaggedTemplateExpression} node Root node
 * @param {ESTree.TemplateElement} quasi Quasi to generate placeholder
 * for
 * @return {string}
 */
export function getExpressionPlaceholder(
  node: ESTree.TaggedTemplateExpression,
  quasi: ESTree.TemplateElement
): string {
  const i = node.quasi.quasis.indexOf(quasi);

  if (/=$/.test(quasi.value.raw)) {
    return `"{{__Q:${i}__}}"`;
  }
  return `{{__Q:${i}__}}`;
}

/**
 * Tests whether a string is a placeholder or not
 *
 * @param {string} value Value to test
 * @return {boolean}
 */
export function isExpressionPlaceholder(value: string): boolean {
  return /^\{\{__Q:\d+__\}\}$/.test(value);
}

/**
 * Converts a template expression into HTML
 *
 * @param {ESTree.TaggedTemplateExpression} node Node to convert
 * @return {string}
 */
export function templateExpressionToHtml(
  node: ESTree.TaggedTemplateExpression
): string {
  let html = '';

  for (let i = 0; i < node.quasi.quasis.length; i++) {
    const quasi = node.quasi.quasis[i];
    const expr = node.quasi.expressions[i];
    html += quasi.value.raw;
    if (expr) {
      html += getExpressionPlaceholder(node, quasi);
    }
  }

  return html;
}

const transformFuncs = {
  snake(str: string): string {
    return str
      .replace(/([A-Z]($|[a-z]))/g, '_$1')
      .replace(/^_/g, '')
      .toLowerCase();
  },
  kebab(str: string): string {
    return str
      .replace(/([A-Z]($|[a-z]))/g, '-$1')
      .replace(/^-/g, '')
      .toLowerCase();
  },
  pascal(str: string): string {
    return str.replace(/^./g, (c) => c.toLowerCase());
  },
  none(str: string): string {
    return str;
  }
};

export const hasFileName = (context: Rule.RuleContext): boolean => {
  const file = context.getFilename();
  return !(file === '<input>' || file === '<text>');
};

export const isValidFilename = (
  context: Rule.RuleContext,
  node: ESTree.Node,
  elementName: string
): void => {
  const ext = extname(context.getFilename());
  const filename = basename(context.getFilename(), ext);
  const transforms: Array<'snake' | 'kebab' | 'pascal'> = [].concat(
    context.options?.[0]?.transform || ['kebab']
  );

  const allowedFilenames = transforms.map((transform) => {
    return transformFuncs[transform](elementName);
  });
  if (!allowedFilenames.some((f) => f === filename)) {
    context.report({
      node,
      message: `File name should be one of ["${allowedFilenames
        .map((f) => `${f}${ext}`)
        .join(',')}"] but was "${filename}"`
    });
  }
};
