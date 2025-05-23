/**
 * @fileoverview Disallows usages of "non-public" property bindings
 * @author Michael Stramel <https://github.com/stramel>
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
      description: 'Disallows usages of "non-public" property bindings',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-private-properties.md'
    },
    schema: [
      {
        type: 'object',
        properties: {
          private: {type: 'string', minLength: 1, format: 'regex'},
          protected: {type: 'string', minLength: 1, format: 'regex'}
        },
        additionalProperties: false,
        minProperties: 1
      }
    ],
    messages: {
      noPrivate:
        'Private and protected properties should not be assigned in bindings'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();
    const config: Partial<{private: string; protected: string}> =
      context.options[0] || {};
    const conventions = Object.entries(config).reduce<Record<string, RegExp>>(
      (acc, [key, value]) => {
        if (value) {
          acc[key] = new RegExp(value);
        }
        return acc;
      },
      {}
    );
    const conventionRegexes = Object.values(conventions);

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

          analyzer.traverse({
            enterElement: (element): void => {
              // eslint-disable-next-line guard-for-in
              for (const attr in element.attribs) {
                const loc = analyzer.getLocationForAttribute(
                  element,
                  attr,
                  source
                );

                if (!loc) {
                  continue;
                }

                const hasPropertyBinding = '.' === attr.slice(0, 1);
                if (!hasPropertyBinding) {
                  continue;
                }

                const invalidPropertyName = conventionRegexes.some(
                  (convention) => convention.test(attr.slice(1))
                );

                if (invalidPropertyName) {
                  context.report({
                    loc,
                    messageId: 'noPrivate'
                  });
                }
              }
            }
          });
        }
      }
    };
  }
};
