/**
 * @fileoverview Enforces calling `super` in lifecycle methods
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {isLitClass} from '../util';

const methodNames = ['connectedCallback', 'disconnectedCallback', 'update'];

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Enforces calling `super` in lifecycle methods',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/lifecycle-super.md'
    },
    schema: [],
    messages: {
      callSuper:
        'You must call `super.{{method}}` to avoid interrupting ' +
        'the lit rendering lifecycle'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    let inElement = false;
    let currentMethod: string | null = null;
    let superSeen = false;

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Class entered
     *
     * @param {ESTree.Class} node Node entered
     * @return {void}
     */
    function classEnter(node: ESTree.Class): void {
      if (!isLitClass(node)) {
        return;
      }

      inElement = true;
    }

    /**
     * Class exited
     *
     * @return {void}
     */
    function classExit(): void {
      inElement = false;
    }

    /**
     * Method entered
     *
     * @param {ESTree.MethodDefinition} node Node entered
     * @return {void}
     */
    function methodEnter(node: ESTree.MethodDefinition): void {
      if (
        !inElement ||
        node.static === true ||
        node.kind !== 'method' ||
        node.key.type !== 'Identifier' ||
        !methodNames.includes(node.key.name)
      ) {
        return;
      }

      currentMethod = node.key.name;
    }

    /**
     * Method exited
     *
     * @param {ESTree.MethodDefinition} node Node entered
     * @return {void}
     */
    function methodExit(node: ESTree.MethodDefinition): void {
      if (currentMethod !== null && !superSeen) {
        context.report({
          node,
          messageId: 'callSuper',
          data: {
            method: currentMethod
          }
        });
      }

      currentMethod = null;
      superSeen = false;
    }

    /**
     * Call expression entered
     * @param {ESTree.CallExpression} node Node entered
     * @return {void}
     */
    function callExpressionEnter(node: ESTree.CallExpression): void {
      if (currentMethod === null) {
        return;
      }

      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Super' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === currentMethod
      ) {
        superSeen = true;
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      ClassExpression: (node: ESTree.Node): void =>
        classEnter(node as ESTree.Class),
      ClassDeclaration: (node: ESTree.Node): void =>
        classEnter(node as ESTree.Class),
      'ClassExpression:exit': classExit,
      'ClassDeclaration:exit': classExit,
      MethodDefinition: (node: ESTree.Node): void =>
        methodEnter(node as ESTree.MethodDefinition),
      'MethodDefinition:exit': methodExit,
      CallExpression: (node: ESTree.CallExpression): void =>
        callExpressionEnter(node)
    };
  }
};

export = rule;
