/**
 * @fileoverview Disallows invalid escape sequences in template strings
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
      description: 'Disallows invalid escape sequences in template strings',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-invalid-escape-sequences.md'
    },
    messages: {
      invalid:
        'Some escape sequences are invalid in template strings. ' +
        'They should either be escaped again (e.g. "\\02c") or interpolated'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();
    const escapePattern = /(^|[^\\])\\([1-7][0-7]*|[0-7]{2,})+/;

    return {
      TaggedTemplateExpression: (node: ESTree.Node): void => {
        if (
          node.type === 'TaggedTemplateExpression' &&
          node.tag.type === 'Identifier' &&
          node.tag.name === 'html'
        ) {
          for (const quasi of node.quasi.quasis) {
            const match = quasi.value.raw.match(escapePattern);

            if (quasi.range && match && match.index !== undefined) {
              const pos = source.getLocFromIndex(
                quasi.range[0] + 1 + match.index
              );
              context.report({
                loc: {start: pos, end: pos},
                messageId: 'invalid'
              });
            }
          }
        }
      }
    };
  }
};

export = rule;
