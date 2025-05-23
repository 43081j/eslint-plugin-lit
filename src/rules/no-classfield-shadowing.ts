/**
 * @fileoverview Disallows properties shadowed as class fields
 * @author Michel Langeveld <https://github.com/michellangeveld>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {
  getClassFields,
  getPropertyMap,
  isLitClass,
  hasLitPropertyDecorator
} from '../util.js';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows properties shadowed as class fields',
      recommended: true,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-classfield-shadowing.md'
    },
    schema: [],
    messages: {
      noClassfieldShadowing:
        'The {{ prop }} property is a class field which has the same name as ' +
        'a reactive property which could have unintended side-effects.'
    }
  },

  create(context): Rule.RuleListener {
    return {
      ClassDeclaration: (node: ESTree.Class): void => {
        if (isLitClass(node, context)) {
          const propertyMap = getPropertyMap(node);
          const classMembers = getClassFields(node);

          for (const [prop, {key}] of propertyMap.entries()) {
            const member = classMembers.get(prop);
            if (member && !hasLitPropertyDecorator(member)) {
              context.report({
                node: key,
                messageId: 'noClassfieldShadowing',
                data: {prop}
              });
            }
          }
        }
      }
    };
  }
};
