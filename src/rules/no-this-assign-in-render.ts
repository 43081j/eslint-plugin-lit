/**
 * @fileoverview Disallows assignments to members of `this` in render methods
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
      description:
        'Disallows assignments to members of `this` in render methods',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-this-assign-in-render.md'
    },
    schema: [],
    messages: {
      noThis:
        'Members of `this` should not be assigned to in the render ' +
        'method. It is likely you should do this elsewhere instead ' +
        '(e.g. in `updated`)'
    }
  },

  create(context): Rule.RuleListener {
    let inRender = false;
    let inComponent = false;

    /**
     * Class entered
     *
     * @param {ESTree.Class} node Node entered
     * @return {void}
     */
    function classEnter(node: ESTree.Class): void {
      if (
        !node.superClass ||
        node.superClass.type !== 'Identifier' ||
        node.superClass.name !== 'LitElement'
      ) {
        return;
      }

      inComponent = true;
    }

    /**
     * Class exited
     *
     * @return {void}
     */
    function classExit(): void {
      inComponent = false;
    }

    /**
     * Method entered
     *
     * @param {ESTree.MethodDefinition} node Node entered
     * @return {void}
     */
    function methodEnter(node: ESTree.MethodDefinition): void {
      if (
        !inComponent ||
        node.kind !== 'method' ||
        node.static === true ||
        node.key.type !== 'Identifier' ||
        node.key.name !== 'render'
      ) {
        return;
      }

      inRender = true;
    }

    /**
     * Method exited
     *
     * @return {void}
     */
    function methodExit(): void {
      inRender = false;
    }

    /**
     * Left side of an assignment expr found
     *
     * @param {Rule.Node} node Node entered
     * @return {void}
     */
    function assignmentFound(node: Rule.Node): void {
      if (!inRender) {
        return;
      }

      context.report({
        node: node.parent,
        messageId: 'noThis'
      });
    }

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
      'AssignmentExpression > .left:has(ThisExpression)': (
        node: Rule.Node
      ): void => assignmentFound(node)
    };
  }
};

export = rule;
