/**
 * @fileoverview Detects usages of "non-public" properties
 * @author Michael Stramel <https://github.com/stramel>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Detects usages of "non-public" properties',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-private-properties.md'
    },
    messages: {
      unsupported: 'TODO'
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
    ]
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const config: {private?: string; protected?: string} =
      context.options[0] || {};
    const conventions = Object.entries(config).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key] = new RegExp(value);
        }
        return acc;
      },
      {} as {[key: string]: RegExp}
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
                const loc = analyzer.getLocationForAttribute(element, attr);

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
                    messageId: 'unsupported'
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

export = rule;
