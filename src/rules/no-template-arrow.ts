/**
 * @fileoverview Disallows arrow functions in templates
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows arrow functions in templates',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-template-arrow.md'
    },
    schema: [],
    messages: {
      noArrow:
        'Arrow functions should not be used in templates. ' +
        'LitElement event bindings are bound automatically, ' + 
        'otherwise a method/function should be bound outside the render method (e.g. in the constructor) beforehand'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Determines whether a node is a disallowed expression
     * or not.
     *
     * @param {ESTree.Node} node
     * @return {boolean}
     */
    function isDisallowedExpr(node: ESTree.Node): boolean {
      if (
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'FunctionExpression'
      ) {
        return true;
      }

      if (node.type === 'ConditionalExpression') {
        return (
          isDisallowedExpr(node.test) ||
          isDisallowedExpr(node.consequent) ||
          isDisallowedExpr(node.alternate)
        );
      }

      return false;
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      TaggedTemplateExpression: (node: ESTree.Node): void => {
        if (
          node.type === 'TaggedTemplateExpression' &&
          node.tag.type === 'Identifier' &&
          node.tag.name === 'html'
        ) {
          for (const expr of node.quasi.expressions) {
            if (isDisallowedExpr(expr)) {
              context.report({
                node: expr,
                messageId: 'noArrow'
              });
            }
          }
        }
      }
    };
  }
};
