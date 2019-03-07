/**
 * @fileoverview Disallows redundant literal values in templates
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows redundant literal values in templates',
      category: 'Best Practices',
      recommended: true,
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-useless-template-literals.md'
    },
    messages: {
      useless: 'Literals must not be substituted into templates'
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
        /* istanbul ignore else */
        if (node.type === 'TaggedTemplateExpression') {
          for (const expr of node.quasi.expressions) {
            if (expr.type === 'Literal') {
              context.report({
                node: expr,
                messageId: 'useless'
              });
            }
          }
        }
      }
    };
  }
};

export = rule;
