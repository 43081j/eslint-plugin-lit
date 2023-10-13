import * as ESTree from 'estree';
import {PropertyDefinition} from 'estree';

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
  key: ESTree.Node;
  expr: ESTree.ObjectExpression | null;
  state: boolean;
  attribute: boolean;
}

/**
 * Extracts property metadata from a given property object
 * @param {ESTree.Node} key Node to extract from
 * @param {ESTree.ObjectExpression} value Node to extract from
 * @return {object}
 */
export function extractPropertyEntry(
  key: ESTree.Node,
  value: ESTree.ObjectExpression
): PropertyMapEntry {
  let state = false;
  let attribute = true;

  for (const prop of value.properties) {
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
    expr: value,
    key,
    state,
    attribute
  };
}

/**
 * Returns the class fields of a class
 * @param {ESTree.Class} node Class to retrieve class fields for
 * @return {ReadonlyMap<string, ESTreeObjectExpression>}
 */
export function getClassFields(
  node: ESTree.Class
): ReadonlyMap<string, PropertyDefinition> {
  const result = new Map<string, PropertyDefinition>();

  for (const member of node.body.body) {
    if (
      member.type === 'PropertyDefinition' &&
      member.key.type === 'Identifier'
    ) {
      result.set(member.key.name, member);
    }
  }
  return result;
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
      member.type === 'PropertyDefinition' &&
      member.static &&
      member.key.type === 'Identifier' &&
      member.key.name === 'properties' &&
      member.value?.type === 'ObjectExpression'
    ) {
      for (const prop of member.value.properties) {
        if (prop.type === 'Property') {
          const name = getIdentifierName(prop.key);

          if (name && prop.value.type === 'ObjectExpression') {
            result.set(name, extractPropertyEntry(prop.key, prop.value));
          }
        }
      }
    }

    if (
      member.type === 'MethodDefinition' &&
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
              result.set(name, extractPropertyEntry(prop.key, prop.value));
            }
          }
        }
      }
    }

    if (
      member.type === 'MethodDefinition' ||
      member.type === 'PropertyDefinition'
    ) {
      const babelProp = member as BabelProperty;
      const key = member.key;
      const memberName = getIdentifierName(key);

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
              const entry = extractPropertyEntry(key, dArg);
              if (state) {
                entry.state = true;
              }
              result.set(memberName, entry);
            } else {
              const state = internalDecorators.includes(
                decorator.expression.callee.name
              );
              result.set(memberName, {
                key,
                expr: null,
                state,
                attribute: true
              });
            }
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
  // Just a rough guess at if this might be an attribute binding or not
  const possibleAttr = /\s[^\s\/>"'=]+=$/;

  if (possibleAttr.test(quasi.value.raw)) {
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
