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
          style: {type: 'string', enum: ['none', 'kebab', 'snake']}
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
      casedAttributeStyled:
        'Attributes are case-insensitive. Attributes should be written as a ' +
        '{{style}} name'
    }
  },

  create(context): Rule.RuleListener {
    const style: string = context.options.length && context.options[0].style
      ? context.options[0].style
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
              if (style === null) {
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
                let styleName: string;
                let styledKey: string;

                switch (style) {
                  case 'snake':
                    styleName = 'snake_case';
                    styledKey = toSnakeCase(prop);
                    break;
                  case 'kebab':
                    styleName = 'kebab-case';
                    styledKey = toKebabCase(prop);
                    break;
                  default:
                    styleName = 'lower case';
                    styledKey = prop.toLowerCase();
                    break;
                }

                if (propConfig.attributeName !== styledKey) {
                  context.report({
                    node: propConfig.expr ?? propConfig.key,
                    messageId: 'casedAttributeStyled',
                    data: {style: styleName}
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
