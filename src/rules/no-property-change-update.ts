/**
 * @fileoverview Disallows property changes in the `update` lifecycle method
 * @author James Garbutt <htttps://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';

interface BabelDecorator extends ESTree.BaseNode {
  type: 'Decorator';
  expression: ESTree.Expression;
}

interface BabelProperty extends ESTree.MethodDefinition {
  decorators?: BabelDecorator[];
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Disallows property changes in the `update` lifecycle method',
      category: 'Best Practices',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-property-change-update.md'
    },
    messages: {
      propertyChange: `Properties should not be changed in the update lifecycle method as they will not trigger re-renders`
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    let propertyMap: ReadonlyMap<string, ESTree.ObjectExpression>|null = null;
    let inUpdate = false;

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Get the name of a node
     *
     * @param {ESTree.Node} node Node to retrieve name of
     * @return {?string}
     */
    function getIdentifierName(node: ESTree.Node): string|undefined {
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
    function getPropertyMap(
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

    /**
     * Class entered
     *
     * @param {ESTree.Class} node Node entered
     * @return {void}
     */
    function classEnter(node: ESTree.Class): void {
      if (!node.superClass ||
          node.superClass.type !== 'Identifier' ||
          node.superClass.name !== 'LitElement') {
        return;
      }

      const props = getPropertyMap(node);

      if (props) {
        propertyMap = props;
      }
    }

    /**
     * Class exited
     *
     * @return {void}
     */
    function classExit(): void {
      propertyMap = null;
    }

    /**
     * Method entered
     *
     * @param {ESTree.MethodDefinition} node Node entered
     * @return {void}
     */
    function methodEnter(node: ESTree.MethodDefinition): void {
      if (!propertyMap ||
          node.kind !== 'method' ||
          node.key.type !== 'Identifier' ||
          node.key.name !== 'update') {
        return;
      }

      inUpdate = true;
    }

    /**
     * Method exited
     *
     * @return {void}
     */
    function methodExit(): void {
      inUpdate = false;
    }

    /**
     * Assignment expression entered
     *
     * @param {ESTree.AssignmentExpression} node Node entered
     * @return {void}
     */
    function assignmentFound(node: ESTree.AssignmentExpression): void {
      if (!propertyMap ||
          !inUpdate ||
          node.left.type !== 'MemberExpression' ||
          node.left.object.type !== 'ThisExpression' ||
          node.left.property.type !== 'Identifier') {
        return;
      }

      const prop = propertyMap.get(node.left.property.name);

      if (!prop) {
        return;
      }

      context.report({
        node: node,
        messageId: 'propertyChange'
      });
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      'ClassExpression': (node: ESTree.Node): void =>
        classEnter(node as ESTree.Class),
      'ClassDeclaration': (node: ESTree.Node): void =>
        classEnter(node as ESTree.Class),
      'ClassExpression:exit': classExit,
      'ClassDeclaration:exit': classExit,
      'MethodDefinition': (node: ESTree.Node): void =>
        methodEnter(node as ESTree.MethodDefinition),
      'MethodDefinition:exit': methodExit,
      'AssignmentExpression': (node: ESTree.Node): void =>
        assignmentFound(node as ESTree.AssignmentExpression)
    };
  }
};

export = rule;
