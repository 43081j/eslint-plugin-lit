/**
 * @fileoverview Disallows property changes in the `update` lifecycle method
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {getPropertyMap, isLitClass, PropertyMapEntry} from '../util';

const superUpdateQuery =
  'CallExpression' +
  '[callee.object.type = "Super"]' +
  '[callee.property.name = "update"]';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Disallows property changes in the `update` lifecycle method',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-property-change-update.md'
    },
    schema: [],
    messages: {
      propertyChange:
        'Properties should not be changed in the update lifecycle method as' +
        ' they will not trigger re-renders'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    let propertyMap: ReadonlyMap<string, PropertyMapEntry> | null = null;
    let inUpdate = false;
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
        node.static === true ||
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
      superSeen = false;
    }

    /**
     * Assignment expression entered
     *
     * @param {ESTree.AssignmentExpression} node Node entered
     * @return {void}
     */
    function assignmentFound(node: ESTree.AssignmentExpression): void {
      if (
        !superSeen ||
        !propertyMap ||
        !inUpdate ||
        node.left.type !== 'MemberExpression' ||
        node.left.object.type !== 'ThisExpression' ||
        node.left.property.type !== 'Identifier'
      ) {
        return;
      }

      const hasProp = propertyMap.has(node.left.property.name);

      if (!hasProp) {
        return;
      }

      context.report({
        node: node,
        messageId: 'propertyChange'
      });
    }

    /**
     * `super.update()` call found
     *
     * @return {void}
     */
    function superUpdateFound(): void {
      if (!inUpdate) {
        return;
      }

      superSeen = true;
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
        assignmentFound(node as ESTree.AssignmentExpression),
      [superUpdateQuery]: (): void => superUpdateFound()
    };
  }
};

export = rule;
