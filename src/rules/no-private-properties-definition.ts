/**
 * @fileoverview Disallows definition of "non-public" property
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {getPropertyMap, isLitClass} from '../util.js';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows definition of "non-public" property',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-private-properties-definition.md'
    },
    schema: [
      {
        type: 'object',
        properties: {
          private: {type: 'string', minLength: 1, format: 'regex'},
          protected: {type: 'string', minLength: 1, format: 'regex'}
        },
        additionalProperties: false
      }
    ],
    messages: {
      noPrivate:
        'Public reactive property should be made public or turned into an ' +
        'internal reactive state'
    },
    defaultOptions: [{}]
  },

  create(context): Rule.RuleListener {
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
      ClassDeclaration: (node: ESTree.Class): void => {
        if (isLitClass(node, context) && conventionRegexes.length > 0) {
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
                messageId: 'noPrivate'
              });
            }
          }
        }
      }
    };
  }
};
