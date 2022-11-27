/**
 * @fileoverview Enforces use of `nothing` constant over empty templates
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
      description: 'Enforces use of `nothing` constant over empty templates',
      category: 'Best Practices',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/prefer-nothing.md'
    },
    schema: [],
    messages: {
      preferNothing:
        '`nothing` is preferred over empty templates when you want to render' +
        ' nothing'
    }
  },

  create(context): Rule.RuleListener {
    return {
      TaggedTemplateExpression: (node: ESTree.Node): void => {
        if (
          node.type === 'TaggedTemplateExpression' &&
          node.tag.type === 'Identifier' &&
          node.tag.name === 'html'
        ) {
          if (
            node.quasi.expressions.length === 0 &&
            node.quasi.quasis.length === 1 &&
            node.quasi.quasis[0].value.raw === ''
          ) {
            context.report({
              node,
              messageId: 'preferNothing'
            });
          }
        }
      }
    };
  }
};

export = rule;
