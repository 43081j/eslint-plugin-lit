/**
 * @fileoverview Disallows assignments to members of `this` in render methods
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {getPropertyMap, isLitClass, PropertyMapEntry} from '../util';

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
    let propertyMap: ReadonlyMap<string, PropertyMapEntry> | null = null;

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

      inComponent = true;
    }

    /**
     * Class exited
     *
     * @return {void}
     */
    function classExit(): void {
      propertyMap = null;
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
     * Walk left side assignment members and return first non-member
     *
     * @param {ESTree.MemberExpression} member Member entered
     * @return {ESTree.Node}
     */
    function walkMembers(member: ESTree.MemberExpression): ESTree.Node {
      if (member.object.type === 'MemberExpression') {
        return walkMembers(member.object);
      } else {
        return member.object;
      }
    }

    /**
     * Left side of an assignment expr found
     *
     * @param {Rule.Node} node Node entered
     * @return {void}
     */
    function assignmentFound(node: Rule.Node): void {
      if (!inRender ||
        !propertyMap ||
        node.type !== 'MemberExpression') {
        return;
      }

      const nonMember = walkMembers(node) as Rule.Node;
      if (nonMember.type === 'ThisExpression') {
        const parent = nonMember.parent as ESTree.MemberExpression;

        let propertyName = '';
        if (parent.property.type === 'Identifier' && !parent.computed) {
          propertyName = parent.property.name;
        } else if (parent.property.type === 'Literal') {
          propertyName = String(parent.property.value);
        }

        if (propertyMap.has(propertyName) || parent.computed) {
          context.report({
            node: node.parent,
            messageId: 'noThis'
          });
        }
      }
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
