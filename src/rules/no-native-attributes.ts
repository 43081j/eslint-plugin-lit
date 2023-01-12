/**
 * @fileoverview Disallows use of native attributes as properties
 * @author Pascal Schilp <https://github.com/thepassle>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {getPropertyMap} from '../util';

// Taken from https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
const NATIVE_ATTRS = [
  'accesskey',
  'autocapitalize',
  'autofocus',
  'class',
  'contenteditable',
  'contextmenu',
  'dir',
  'draggable',
  'enterkeyhint',
  'exportparts',
  'hidden',
  'id',
  'inert',
  'inputmode',
  'is',
  'itemid',
  'itemprop',
  'itemref',
  'itemscope',
  'itemtype',
  'lang',
  'nonce',
  'part',
  'popover',
  'role',
  'slot',
  'spellcheck',
  'style',
  'tabindex',
  'title',
  'translate',
  'virtualkeyboardpolicy'
];

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows use of native attributes as properties',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-native-attributes.md'
    },
    schema: [],
    messages: {
      noNativeAttributes:
        'The {{ prop }} attribute is a native global attribute. ' +
        'Using it as a property could have unintended side-effects.'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      'ClassExpression,ClassDeclaration': (node: ESTree.Class): void => {
        const propertyMap = getPropertyMap(node);

        for (const [prop] of propertyMap.entries()) {
          if (NATIVE_ATTRS.includes(prop)) {
            context.report({
              node: node,
              messageId: 'noNativeAttributes',
              data: {prop}
            });
          }
        }
      }
    };
  }
};

export = rule;
