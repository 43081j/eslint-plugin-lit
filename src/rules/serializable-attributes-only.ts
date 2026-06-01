/**
 * @fileoverview Requires converters for non-serializable attribute types
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
      description: 'Requires converters for non-serializable attribute types',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/serializable-attributes-only.md'
    },
    schema: [
      {
        type: 'object',
        properties: {
          nativeTypes: {
            type: 'array',
            items: {
              type: 'string'
            },
            uniqueItems: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      notSerializable:
        'Public reactive property should either have attribute option set to ' +
        'false or converter option defined'
    },
    defaultOptions: [
      {
        nativeTypes: ['String', 'Number', 'Boolean', 'Array', 'Object']
      }
    ]
  },

  create(context): Rule.RuleListener {
    const nativeTypes = new Set(context.options[0]?.nativeTypes ?? []);

    return {
      ClassDeclaration: (node: ESTree.Class): void => {
        if (isLitClass(node, context)) {
          const propertyMap = getPropertyMap(node);

          for (const propConfig of propertyMap.values()) {
            if (
              propConfig.state ||
              !propConfig.attribute ||
              propConfig.converter
            ) {
              continue;
            }

            if (!nativeTypes.has(propConfig.propertyType ?? 'String')) {
              context.report({
                node: propConfig.key,
                messageId: 'notSerializable'
              });
            }
          }
        }
      }
    };
  }
};
