/**
 * @fileoverview Disallows usages of "non-public" property bindings
 * @author Michael Stramel <https://github.com/stramel>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer.js';
import {getPropertyMap, isLitClass} from '../util.js';

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
          protected: {type: 'string', minLength: 1, format: 'regex'},
          checkPropertyDefinitions: {type: 'boolean'}
        },
        additionalProperties: false
      }
    ],
    messages: {
      noPrivate:
        'Private and protected properties should not be assigned in bindings',
      noPrivateDefinition:
        'Public reactive property should be made public or turned into an ' +
        'internal reactive state'
    },
    defaultOptions: [{}]
  },

  create(context): Rule.RuleListener {
    const source = context.sourceCode;
    const config: Partial<{
      private: string;
      protected: string;
      checkPropertyDefinitions: boolean;
    }> = context.options[0] || {};

    const conventionRegexes : RegExp[] = [];
    if (config.private) {
      conventionRegexes.push(new RegExp(config.private));
    }
    if (config.protected) {
      conventionRegexes.push(new RegExp(config.protected));
    }

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
      },
      ClassDeclaration: (node: ESTree.Class): void => {
        if (
          config.checkPropertyDefinitions &&
          isLitClass(node, context) &&
          conventionRegexes.length > 0
        ) {
          const propertyMap = getPropertyMap(node);

          for (const [prop, propConfig] of propertyMap.entries()) {
            if (propConfig.state) {
              continue;
            }

            const invalidPropertyName = conventionRegexes.some((convention) =>
              convention.test(prop)
            );

            if (invalidPropertyName) {
              context.report({
                node: propConfig.key,
                messageId: 'noPrivateDefinition'
              });
            }
          }
        }
      }
    };
  }
};
