/**
 * @fileoverview Disallows duplicate names in template bindings
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
      description: 'Disallows duplicate names in template bindings',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-duplicate-template-bindings.md'
    },
    schema: [],
    messages: {
      duplicateBinding: 'Duplicate bindings are not allowed.'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();

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
          const dupeErrors = analyzer.errors.filter(
            (err): boolean => err.code === 'duplicate-attribute'
          );

          for (const err of dupeErrors) {
            const loc = analyzer.resolveLocation(err, source);

            if (loc) {
              context.report({
                loc: loc,
                messageId: 'duplicateBinding'
              });
            }
          }
        }
      }
    };
  }
};
