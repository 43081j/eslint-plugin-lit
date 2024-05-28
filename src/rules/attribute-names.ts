/**
 * @fileoverview Enforces attribute naming conventions
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {getPropertyMap, isLitClass} from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Enforces attribute naming conventions',
      recommended: true,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/attribute-names.md'
    },
    schema: [],
    messages: {
      casedAttribute:
        'Attributes are case-insensitive and therefore should be ' +
        'defined in lower case',
      casedPropertyWithoutAttribute:
        'Property has non-lowercase casing but no attribute. It should ' +
        'instead have an explicit `attribute` set to the lower case ' +
        'name (usually snake-case)'
    }
  },

  create(context): Rule.RuleListener {
    return {
      ClassDeclaration: (node: ESTree.Class): void => {
        if (isLitClass(node)) {
          const propertyMap = getPropertyMap(node);

          for (const [prop, propConfig] of propertyMap.entries()) {
            if (!propConfig.attribute || propConfig.state) {
              continue;
            }

            if (!propConfig.attributeName) {
              if (prop.toLowerCase() !== prop) {
                context.report({
                  node: propConfig.key,
                  messageId: 'casedPropertyWithoutAttribute'
                });
              }
            } else {
              if (
                propConfig.attributeName.toLowerCase() !==
                propConfig.attributeName
              ) {
                context.report({
                  node: propConfig.expr ?? propConfig.key,
                  messageId: 'casedAttribute'
                });
              }
            }
          }
        }
      }
    };
  }
};

export = rule;
