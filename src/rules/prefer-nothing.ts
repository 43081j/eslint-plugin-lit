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
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/prefer-nothing.md'
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      preferNothing:
        '`nothing` is preferred over empty templates when you want to render' +
        ' nothing',
      useNothing: 'Replace empty template with `nothing` constant'
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
              messageId: 'preferNothing',
              suggest: [
                {
                  messageId: 'useNothing',
                  fix: (fixer) => {
                    return fixer.replaceText(node, 'nothing');
                  }
                }
              ]
            });
          }
        }
      }
    };
  }
};

export = rule;
