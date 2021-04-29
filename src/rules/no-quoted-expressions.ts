/**
 * @fileoverview Disallows quoted expressions in template bindings
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
      description: 'Disallows quoted expressions in template bindings',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-quoted-expressions.md'
    },
    messages: {
      quoteError:
        'Expressions should not be quoted inside templates ' +
        ' (e.g. `foo="${bar}"`)'
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
          for (let i = 0; i < node.quasi.expressions.length; i++) {
            const expression = node.quasi.expressions[i];
            const previousQuasi = node.quasi.quasis[i];
            const nextQuasi = node.quasi.quasis[i + 1];

            if (
              (previousQuasi.value.raw.endsWith('"') &&
                nextQuasi.value.raw.startsWith('"')) ||
              (previousQuasi.value.raw.endsWith("'") &&
                nextQuasi.value.raw.startsWith("'"))
            ) {
              context.report({
                node: expression,
                messageId: 'quoteError'
              });
            }
          }
        }
      }
    };
  }
};

export = rule;
