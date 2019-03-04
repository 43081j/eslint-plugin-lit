/**
 * @fileoverview Disallows property changes in the `update` lifecycle method
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {getPropertyMap} from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Disallows property changes in the `update` lifecycle method',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-property-change-update.md'
    },
    messages: {
      propertyChange:
        'Properties should not be changed in the update lifecycle method as' +
        ' they will not trigger re-renders'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    let propertyMap: ReadonlyMap<string, ESTree.ObjectExpression> | null = null;
    let inUpdate = false;

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
      if (
        !node.superClass ||
        node.superClass.type !== 'Identifier' ||
        node.superClass.name !== 'LitElement'
      ) {
        return;
      }

      const props = getPropertyMap(node);

      if (props) {
        propertyMap = props;
      }
    }

    /**
     * Class exited
     *
     * @return {void}
     */
    function classExit(): void {
      propertyMap = null;
    }

    /**
     * Method entered
     *
     * @param {ESTree.MethodDefinition} node Node entered
     * @return {void}
     */
    function methodEnter(node: ESTree.MethodDefinition): void {
      if (
        !propertyMap ||
        node.kind !== 'method' ||
        node.key.type !== 'Identifier' ||
        node.key.name !== 'update'
      ) {
        return;
      }

      inUpdate = true;
    }

    /**
     * Method exited
     *
     * @return {void}
     */
    function methodExit(): void {
      inUpdate = false;
    }

    /**
     * Assignment expression entered
     *
     * @param {ESTree.AssignmentExpression} node Node entered
     * @return {void}
     */
    function assignmentFound(node: ESTree.AssignmentExpression): void {
      if (
        !propertyMap ||
        !inUpdate ||
        node.left.type !== 'MemberExpression' ||
        node.left.object.type !== 'ThisExpression' ||
        node.left.property.type !== 'Identifier'
      ) {
        return;
      }

      const prop = propertyMap.get(node.left.property.name);

      if (!prop) {
        return;
      }

      context.report({
        node: node,
        messageId: 'propertyChange'
      });
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
      AssignmentExpression: (node: ESTree.Node): void =>
        assignmentFound(node as ESTree.AssignmentExpression)
    };
  }
};

export = rule;
