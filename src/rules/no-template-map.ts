/**
 * @fileoverview Disallows array `.map` in templates
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
      description: 'Disallows array `.map` in templates',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-template-map.md'
    },
    schema: [],
    messages: {
      noMap:
        '`.map` is disallowed in templates, move the expression out' +
        ' of the template instead'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

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
            if (
              expr.type === 'CallExpression' &&
              expr.callee.type === 'MemberExpression' &&
              expr.callee.property.type === 'Identifier' &&
              expr.callee.property.name === 'map'
            ) {
              context.report({
                node: expr,
                messageId: 'noMap'
              });
            }
          }
        }
      }
    };
  }
};
