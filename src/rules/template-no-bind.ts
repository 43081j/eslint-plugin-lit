/**
 * @fileoverview Disallows arrow functions and `.bind` in templates
 * @author James Garbutt <htttps://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows arrow functions and `.bind` in templates',
      category: 'Best Practices',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/template-no-bind.md'
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
      if (node.type === 'ArrowFunctionExpression' ||
          node.type === 'FunctionExpression') {
        return true;
      }

      if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'bind') {
        return true;
      }

      if (node.type === 'ConditionalExpression') {
        return isDisallowedExpr(node.test) ||
          isDisallowedExpr(node.consequent) ||
          isDisallowedExpr(node.alternate);
      }

      return false;
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      'TaggedTemplateExpression': (node: ESTree.Node): void => {
        if (node.type === 'TaggedTemplateExpression' &&
          node.tag.type === 'Identifier' &&
          node.tag.name === 'html') {
          for (const expr of node.quasi.expressions) {
            if (isDisallowedExpr(expr)) {
              context.report({
                node: expr,
                message: 'Arrow functions and `.bind` must not be used in templates'
              });
            }
          }
        }
      }
    };
  }
};

export = rule;
