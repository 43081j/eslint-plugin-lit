/**
 * @fileoverview Disallows invalid escape sequences in template strings
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
      description: 'Disallows invalid escape sequences in template strings',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-invalid-escape-sequences.md'
    },
    fixable: 'code',
    schema: [],
    messages: {
      invalid:
        'Some escape sequences are invalid in template strings. ' +
        'They should either be escaped again (e.g. "\\\\02c") or interpolated'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();
    const escapePattern = /(^|[^\\](?:\\\\)*)(\\([1-7][0-7]*|[0-7]{2,}))/g;

    return {
      TaggedTemplateExpression: (node: ESTree.Node): void => {
        if (
          node.type === 'TaggedTemplateExpression' &&
          node.tag.type === 'Identifier' &&
          node.tag.name === 'html'
        ) {
          for (const quasi of node.quasi.quasis) {
            if (quasi.range) {
              const results = quasi.value.raw.matchAll(escapePattern);

              for (const match of results) {
                if (match.index !== undefined) {
                  const rangeStart =
                    quasi.range[0] + 1 + match.index + match[1].length;
                  const rangeEnd = rangeStart + match[2].length;
                  const start = source.getLocFromIndex(rangeStart);
                  const end = source.getLocFromIndex(rangeEnd);
                  context.report({
                    loc: {start, end},
                    messageId: 'invalid',
                    fix: (fixer) =>
                      fixer.insertTextBeforeRange([rangeStart, rangeEnd], '\\')
                  });
                }
              }
            }
          }
        }
      }
    };
  }
};
