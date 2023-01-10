/**
 * @fileoverview Disallows use of native attributes as properties
 * @author Pascal Schilp <https://github.com/thepassle>
 */

import { Rule } from 'eslint';
import * as ESTree from 'estree';

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
        'Avoid using global native attributes as properties, ' +
        'this can have unintended effects'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here

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
      'role',
      'slot',
      'spellcheck',
      'style',
      'tabindex',
      'title',
      'translate',
      'virtualkeyboardpolicy'
    ];

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      'ClassExpression,ClassDeclaration': (node: ESTree.Class): void => {
        for (const member of node.body.body) {
          if (
            member.type === 'MethodDefinition' &&
            member.kind === 'get' &&
            member.static &&
            member.key.type === 'Identifier' &&
            member.key.name === 'properties'
          ) {
            const returnValue = member.value.body.body
              .find((statement) => statement.type === 'ReturnStatement');

            if (returnValue) {
              const object = returnValue.argument;

              if (object) {
                for (const property of object.properties) {
                  if (
                    property.type === 'Property' &&
                    NATIVE_ATTRS.includes((property.key as ESTree.Identifier).name)
                  ) {
                    context.report({
                      node: member,
                      messageId: 'noNativeAttributes'
                    });
                  }
                }
              }
            }
          }

          if (
            member.type === 'PropertyDefinition' &&
            member.static &&
            member.key.type === 'Identifier' &&
            member.key.name === 'properties'
          ) {
            const value = member.value as ESTree.ObjectExpression;
            for (const property of value.properties) {
              if (
                property.type === 'Property' &&
                NATIVE_ATTRS.includes((property.key as ESTree.Identifier).name)
              ) {
                context.report({
                  node: member,
                  messageId: 'noNativeAttributes'
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
