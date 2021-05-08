/**
 * @fileoverview Requires that listeners be cleaned up on DOM disconnect
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Requires that listeners be cleaned up on DOM disconnect.',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/require-listener-teardown.md'
    },
    messages: {
      noTeardown:
        'Event listeners attached in `connectedCallback` should be' +
        'torn down during `disconnectedCallback`'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const addListenerQuery =
      'MethodDefinition[key.name="connectedCallback"] ' +
      'CallExpression[callee.property.name="addEventListener"]';
    const removeListenerQuery =
      'MethodDefinition[key.name="disconnectedCallback"] ' +
      'CallExpression[callee.property.name="removeEventListener"]';
    const seen = new Map<string, ESTree.CallExpression>();

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    const onAddListener = (node: ESTree.CallExpression): void => {
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'ThisExpression'
      ) {
        const arg0 = node.arguments[0];
        if (arg0.type === 'Literal' && typeof arg0.value === 'string') {
          seen.set(arg0.value, node);
        }
      }
    };
    const onRemoveListener = (node: ESTree.CallExpression): void => {
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'ThisExpression'
      ) {
        const arg0 = node.arguments[0];
        if (arg0.type === 'Literal' && typeof arg0.value === 'string') {
          seen.delete(arg0.value);
        }
      }
    };
    const classExit = (): void => {
      for (const expr of seen.values()) {
        context.report({
          node: expr,
          messageId: 'noTeardown'
        });
      }
      seen.clear();
    };

    return {
      [addListenerQuery]: (node: ESTree.Node): void =>
        onAddListener(node as ESTree.CallExpression),
      [removeListenerQuery]: (node: ESTree.Node): void =>
        onRemoveListener(node as ESTree.CallExpression),
      'ClassExpression:exit': classExit,
      'ClassDeclaration:exit': classExit
    };
  }
};

export = rule;
