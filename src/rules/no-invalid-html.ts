/**
 * @fileoverview Disallows invalid HTML in templates
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer.js';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows invalid HTML in templates',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-invalid-html.md'
    },
    schema: [],
    messages: {
      parseError: 'Template contained invalid HTML syntax, error was: {{ err }}'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.sourceCode;

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
          const analyzer = TemplateAnalyzer.create(node);

          for (const err of analyzer.errors) {
            // Ignore these as the duplicate attributes rule handles them
            if (err.code === 'duplicate-attribute') {
              continue;
            }

            const loc = analyzer.resolveLocation(err, source);

            if (loc) {
              context.report({
                loc: loc,
                messageId: 'parseError',
                data: {err: err.code}
              });
            }
          }
        }
      }
    };
  }
};
