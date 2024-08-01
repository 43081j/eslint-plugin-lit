/**
 * @fileoverview Enforces attribute naming conventions
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {getPropertyMap, isLitClass, toKebabCase, toSnakeCase} from '../util';

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
    schema: [
      {
        type: 'object',
        properties: {
          convention: {type: 'string', enum: ['none', 'kebab', 'snake']}
        },
        additionalProperties: false,
        minProperties: 1
      }],
    messages: {
      casedAttribute:
        'Attributes are case-insensitive and therefore should be ' +
        'defined in lower case',
      casedPropertyWithoutAttribute:
        'Property has non-lowercase casing but no attribute. It should ' +
        'instead have an explicit `attribute` set to the lower case ' +
        'name (usually snake-case)',
      casedAttributeConvention:
        'Attribute should be property name written in {{convention}}'
    }
  },

  create(context): Rule.RuleListener {
    const convention: string = context.options.length
        && context.options[0].convention
      ? context.options[0].convention
      : null;

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
              if (convention === null) {
                if (
                  propConfig.attributeName.toLowerCase() !==
                  propConfig.attributeName
                ) {
                  context.report({
                    node: propConfig.expr ?? propConfig.key,
                    messageId: 'casedAttribute'
                  });
                }
              } else {
                let conventionName: string;
                let expectedAttributeName: string;

                switch (convention) {
                  case 'snake':
                    conventionName = 'snake_case';
                    expectedAttributeName = toSnakeCase(prop);
                    break;
                  case 'kebab':
                    conventionName = 'kebab-case';
                    expectedAttributeName = toKebabCase(prop);
                    break;
                  default:
                    conventionName = 'lower case';
                    expectedAttributeName = prop.toLowerCase();
                    break;
                }

                if (propConfig.attributeName !== expectedAttributeName) {
                  context.report({
                    node: propConfig.expr ?? propConfig.key,
                    messageId: 'casedAttributeConvention',
                    data: {convention: conventionName}
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

export = rule;
