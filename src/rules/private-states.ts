/**
 * @fileoverview Enforces private or protected visibility of reactive states
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
      description:
        'Enforces private or protected visibility of reactive states',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/private-states.md'
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
      notPrivateOrProtected: 'State should be private or protected',
      notPrivate: 'State should be private',
      notProtected: 'State should be protected'
    },
    defaultOptions: [{}]
  },

  create(context): Rule.RuleListener {
    const config: Partial<{private: string; protected: string}> =
      context.options[0] || {};
    const privateRegex = config.private ? new RegExp(config.private) : null;
    const protectedRegex = config.protected
      ? new RegExp(config.protected)
      : null;
    const conventionRegexes: RegExp[] = [];
    if (privateRegex) {
      conventionRegexes.push(privateRegex);
    }
    if (protectedRegex) {
      conventionRegexes.push(protectedRegex);
    }

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    function getMessageKey(
      privateRegex: RegExp | null,
      protectedRegex: RegExp | null
    ): string {
      if (privateRegex && protectedRegex) {
        return 'notPrivateOrProtected';
      } else if (privateRegex) {
        return 'notPrivate';
      }

      return 'notProtected';
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      ClassDeclaration: (node: ESTree.Class): void => {
        if (isLitClass(node, context) && conventionRegexes.length > 0) {
          const propertyMap = getPropertyMap(node);

          for (const [prop, propConfig] of propertyMap.entries()) {
            if (!propConfig.state) {
              continue;
            }

            const validPropertyName = conventionRegexes.some((convention) =>
              convention.test(prop)
            );

            if (!validPropertyName) {
              context.report({
                node: propConfig.key,
                messageId: getMessageKey(privateRegex, protectedRegex)
              });
            }
          }
        }
      }
    };
  }
};
