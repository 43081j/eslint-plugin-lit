/**
 * @fileoverview Enforces boolean properties to have a false default value
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
      description: 'Enforces boolean properties to have a false default value',
      recommended: true,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/boolean-property-default-false.md'
    },
    schema: [],
    messages: {
      attributeDefault:
        'Property of type Boolean should have a false default value.'
    }
  },

  create(context): Rule.RuleListener {
    return {
      ClassDeclaration: (node: ESTree.Class): void => {
        if (isLitClass(node, context)) {
          const propertyMap = getPropertyMap(node);

          for (const propConfig of propertyMap.values()) {
            if (propConfig.state) {
              continue;
            }

            if (propConfig.propertyType === 'Boolean') {
              if (propConfig.defaultValueResolver) {
                const defaultValue = propConfig.defaultValueResolver();
                if (defaultValue === null) {
                  context.report({
                    node: propConfig.key,
                    messageId: 'attributeDefault'
                  });
                } else if (
                  defaultValue.type === 'Literal' &&
                  defaultValue.value !== false
                ) {
                  context.report({
                    node: defaultValue,
                    messageId: 'attributeDefault'
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
