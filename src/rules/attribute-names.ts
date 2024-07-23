/**
 * @fileoverview Enforces attribute naming conventions
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {getPropertyMap, isLitClass, toDashCase, toSnakeCase} from '../util';

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
          style: {type: 'string', enum: ['none', 'dash', 'snake']}
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
      casedPropertyStyleNone:
        'Attributes should be defined with lower cased property name',
      casedPropertyStyleSnake:
        'Attributes should be defined with snake_cased property name',
      casedPropertyStyleDash:
        'Attributes should be defined with dash-cased property name'
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
              if (style === 'none') {
                if (propConfig.attributeName !== prop.toLowerCase()) {
                  context.report({
                    node: propConfig.expr ?? propConfig.key,
                    messageId: 'casedPropertyStyleNone'
                  });
                }
              } else if (style === 'snake') {
                if (propConfig.attributeName !== toSnakeCase(prop)) {
                  context.report({
                    node: propConfig.expr ?? propConfig.key,
                    messageId: 'casedPropertyStyleSnake'
                  });
                }
              } else if (style === 'dash') {
                if (propConfig.attributeName !== toDashCase(prop)) {
                  context.report({
                    node: propConfig.expr ?? propConfig.key,
                    messageId: 'casedPropertyStyleDash'
                  });
                }
              } else if (style === null) {
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
      }
    };
  }
};

export = rule;
