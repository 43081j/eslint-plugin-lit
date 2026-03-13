/**
 * @fileoverview Requires use of query decorators instead of manual DOM queries
 * @author Kirill Karpov <https://github.com/null0rUndefined>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {isLitClass} from '../util.js';

//------------------------------------------------------------------------------
// Selectors
//------------------------------------------------------------------------------

const querySelectorCall =
  'CallExpression' +
  '[callee.type="MemberExpression"]' +
  '[callee.object.type="MemberExpression"]' +
  '[callee.object.object.type="ThisExpression"]' +
  ':matches(' +
  '[callee.object.property.name="shadowRoot"],' +
  '[callee.object.property.name="renderRoot"]' +
  ')' +
  ':matches(' +
  '[callee.property.name="querySelector"],' +
  '[callee.property.name="querySelectorAll"]' +
  ')';

const assignedCall =
  'CallExpression' +
  '[callee.type="MemberExpression"]' +
  ':matches(' +
  '[callee.property.name="assignedElements"],' +
  '[callee.property.name="assignedNodes"]' +
  ')' +
  '[callee.object.type="CallExpression"]' +
  '[callee.object.callee.type="MemberExpression"]' +
  '[callee.object.callee.object.type="MemberExpression"]' +
  '[callee.object.callee.object.object.type="ThisExpression"]' +
  ':matches(' +
  '[callee.object.callee.object.property.name="shadowRoot"],' +
  '[callee.object.callee.object.property.name="renderRoot"]' +
  ')' +
  '[callee.object.callee.property.name="querySelector"]';

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

interface Options {
  querySelector: boolean;
  querySelectorAll: boolean;
  assignedElements: boolean;
  assignedNodes: boolean;
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const assignedMethodNames = new Set(['assignedElements', 'assignedNodes']);

const renderRootProperties = new Set(['shadowRoot', 'renderRoot']);

const defaultOptions: Options = {
  querySelector: true,
  querySelectorAll: true,
  assignedElements: true,
  assignedNodes: true
};

const querySelectorMessageMap: Record<string, keyof Options> = {
  querySelector: 'querySelector',
  querySelectorAll: 'querySelectorAll'
};

const assignedMessageMap: Record<string, keyof Options> = {
  assignedElements: 'assignedElements',
  assignedNodes: 'assignedNodes'
};

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Determines if a call expression is the inner querySelector of a chained
 * assignedElements/assignedNodes call, to avoid double-reporting.
 *
 * @param {ESTree.CallExpression} node Call expression to test
 * @return {boolean}
 */
function isChainedWithAssignedCall(node: ESTree.CallExpression): boolean {
  const parent = (node as Rule.Node).parent;
  return (
    parent?.type === 'MemberExpression' &&
    (parent as ESTree.MemberExpression).property.type === 'Identifier' &&
    assignedMethodNames.has(
      ((parent as ESTree.MemberExpression).property as ESTree.Identifier).name
    )
  );
}

/**
 * Returns the method name from a member expression callee, or null if the
 * property is not a simple identifier.
 *
 * @param {ESTree.MemberExpression} callee Callee to inspect
 * @return {string|null}
 */
function getMethodName(callee: ESTree.MemberExpression): string | null {
  return callee.property.type === 'Identifier'
    ? (callee.property as ESTree.Identifier).name
    : null;
}

/**
 * Returns the render root property name (shadowRoot or renderRoot) from a
 * callee whose object is a member expression on `this`, or null if it does
 * not match the expected shape.
 *
 * @param {ESTree.MemberExpression} callee Callee to inspect
 * @return {string|null}
 */
function getRenderRootName(callee: ESTree.MemberExpression): string | null {
  const obj = callee.object as ESTree.MemberExpression;
  if (obj.type !== 'MemberExpression' || obj.property.type !== 'Identifier') {
    return null;
  }
  const name = (obj.property as ESTree.Identifier).name;
  return renderRootProperties.has(name) ? name : null;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires use of query decorators instead of manual DOM queries',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/prefer-query-decorators.md'
    },
    schema: [
      {
        type: 'object',
        properties: {
          querySelector: {type: 'boolean'},
          querySelectorAll: {type: 'boolean'},
          assignedElements: {type: 'boolean'},
          assignedNodes: {type: 'boolean'}
        },
        additionalProperties: false
      }
    ],
    messages: {
      preferQuery:
        'Use @query decorator instead of this.{{ root }}.querySelector()',
      preferQueryAll:
        'Use @queryAll decorator instead of this.{{ root }}.querySelectorAll()',
      preferQueryAssignedElements:
        'Use @queryAssignedElements decorator instead of' +
        ' this.{{ root }}.querySelector().assignedElements()',
      preferQueryAssignedNodes:
        'Use @queryAssignedNodes decorator instead of' +
        ' this.{{ root }}.querySelector().assignedNodes()'
    }
  },

  create(context): Rule.RuleListener {
    const options: Options = {...defaultOptions, ...context.options[0]};
    let litClassDepth = 0;

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
      if (isLitClass(node, context)) {
        litClassDepth++;
      }
    }

    /**
     * Class exited
     *
     * @param {ESTree.Class} node Node exited
     * @return {void}
     */
    function classExit(node: ESTree.Class): void {
      if (isLitClass(node, context)) {
        litClassDepth--;
      }
    }

    /**
     * querySelector or querySelectorAll call found
     *
     * @param {ESTree.CallExpression} node Node entered
     * @return {void}
     */
    function handleQuerySelectorCall(node: ESTree.CallExpression): void {
      if (litClassDepth === 0) return;
      if (isChainedWithAssignedCall(node)) return;

      const callee = node.callee as ESTree.MemberExpression;
      const methodName = getMethodName(callee);
      const rootName = getRenderRootName(callee);

      if (!methodName || !rootName) return;

      const optionKey = querySelectorMessageMap[methodName];
      if (!optionKey || !options[optionKey]) return;

      const messageId =
        methodName === 'querySelector' ? 'preferQuery' : 'preferQueryAll';

      context.report({node, messageId, data: {root: rootName}});
    }

    /**
     * assignedElements or assignedNodes call found
     *
     * @param {ESTree.CallExpression} node Node entered
     * @return {void}
     */
    function handleAssignedCall(node: ESTree.CallExpression): void {
      if (litClassDepth === 0) return;

      const callee = node.callee as ESTree.MemberExpression;
      const methodName = getMethodName(callee);
      if (!methodName) return;

      const querySelectorCallExpr = callee.object as ESTree.CallExpression;
      const querySelectorCallee =
        querySelectorCallExpr.callee as ESTree.MemberExpression;
      const rootName = getRenderRootName(querySelectorCallee);
      if (!rootName) return;

      const optionKey = assignedMessageMap[methodName];
      if (!optionKey || !options[optionKey]) return;

      const messageId =
        methodName === 'assignedElements'
          ? 'preferQueryAssignedElements'
          : 'preferQueryAssignedNodes';

      context.report({node, messageId, data: {root: rootName}});
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      ClassExpression: (node: ESTree.Node): void =>
        classEnter(node as ESTree.Class),
      ClassDeclaration: (node: ESTree.Node): void =>
        classEnter(node as ESTree.Class),
      'ClassExpression:exit': (node: ESTree.Node): void =>
        classExit(node as ESTree.Class),
      'ClassDeclaration:exit': (node: ESTree.Node): void =>
        classExit(node as ESTree.Class),
      [querySelectorCall]: (node: ESTree.Node): void =>
        handleQuerySelectorCall(node as ESTree.CallExpression),
      [assignedCall]: (node: ESTree.Node): void =>
        handleAssignedCall(node as ESTree.CallExpression)
    };
  }
};
