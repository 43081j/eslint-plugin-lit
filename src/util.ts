import * as ESTree from 'estree';

interface BabelDecorator extends ESTree.BaseNode {
  type: 'Decorator';
  expression: ESTree.Expression;
}

interface BabelProperty extends ESTree.MethodDefinition {
  decorators?: BabelDecorator[];
}

/**
 * Get the name of a node
 *
 * @param {ESTree.Node} node Node to retrieve name of
 * @return {?string}
 */
export function getIdentifierName(node: ESTree.Node): string|undefined {
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'Literal') {
    return node.raw;
  }
  return undefined;
}

/**
 * Get the properties object of an element class
 *
 * @param {ESTree.Class} node Class to retrieve map from
 * @return {ReadonlyMap<string, ESTreeObjectExpression>}
 */
export function getPropertyMap(
    node: ESTree.Class): ReadonlyMap<string, ESTree.ObjectExpression> {
  const result = new Map<string, ESTree.ObjectExpression>();

  for (const member of node.body.body) {
    if (member.static &&
        member.kind === 'get' &&
        member.key.type === 'Identifier' &&
        member.key.name === 'properties' &&
        member.value.body) {
      const ret = member.value.body.body.find((m): boolean =>
        m.type === 'ReturnStatement' &&
        m.argument != undefined &&
        m.argument.type === 'ObjectExpression') as ESTree.ReturnStatement;
      if (ret) {
        const arg = ret.argument as ESTree.ObjectExpression;
        for (const prop of arg.properties) {
          const name = getIdentifierName(prop.key);

          if (name && prop.value.type === 'ObjectExpression') {
            result.set(name, prop.value);
          }
        }
      }
    }

    const babelProp = member as BabelProperty;
    const memberName = getIdentifierName(member.key);

    if (memberName && babelProp.decorators) {
      for (const decorator of babelProp.decorators) {
        if (decorator.expression.type === 'CallExpression' &&
            decorator.expression.callee.type === 'Identifier' &&
            decorator.expression.callee.name === 'property' &&
            decorator.expression.arguments.length > 0) {
          const dArg = decorator.expression.arguments[0];
          if (dArg.type === 'ObjectExpression') {
            result.set(memberName, dArg);
          }
        }
      }
    }
  }

  return result;
}
