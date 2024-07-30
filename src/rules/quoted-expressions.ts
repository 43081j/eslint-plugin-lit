/**
 * @fileoverview Enforces the presence or absence of quotes around expressions
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
      description:
        'Enforces the presence or absence of quotes around expressions',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/quoted-expressions.md'
    },
    fixable: 'code',
    schema: [
      {
        enum: ['always', 'never']
      }
    ],
    messages: {
      alwaysQuote:
        'Expressions must be quoted inside templates ' +
        ' (e.g. `foo="${bar}"`)',
      neverQuote:
        'Expressions must not be quoted inside templates ' +
        ' (e.g. `foo="${bar}"`)'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const alwaysQuote = context.options[0] === 'always';
    const quotePattern = /=(["'])?$/;

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
            const quoteMatch = previousQuasi.value.raw.match(quotePattern);

            // don't care about non-attribute bindings
            if (!quoteMatch) {
              continue;
            }

            const hasStartQuote = quoteMatch[1] !== undefined;
            const isQuoted =
              hasStartQuote && nextQuasi.value.raw.startsWith(quoteMatch[1]);

            if (alwaysQuote && !hasStartQuote) {
              context.report({
                node: expression,
                messageId: 'alwaysQuote',
                fix: (fixer) => {
                  if (!previousQuasi.range || !nextQuasi.range) {
                    return [];
                  }

                  return [
                    fixer.insertTextAfterRange(
                      [previousQuasi.range[0], previousQuasi.range[1] - 2],
                      '"'
                    ),
                    fixer.insertTextBeforeRange(
                      [nextQuasi.range[0] + 1, nextQuasi.range[1]],
                      '"'
                    )
                  ];
                }
              });
            }

            if (!alwaysQuote && isQuoted) {
              context.report({
                node: expression,
                messageId: 'neverQuote',
                fix: (fixer) => {
                  if (!previousQuasi.range || !nextQuasi.range) {
                    return [];
                  }

                  return [
                    fixer.removeRange([
                      previousQuasi.range[1] - 3,
                      previousQuasi.range[1] - 2
                    ]),
                    fixer.removeRange([
                      nextQuasi.range[0] + 1,
                      nextQuasi.range[0] + 2
                    ])
                  ];
                }
              });
            }
          }
        }
      }
    };
  }
};

export = rule;
