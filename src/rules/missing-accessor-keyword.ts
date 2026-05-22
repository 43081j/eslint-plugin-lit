/**
 * @fileoverview Enforces accessor keyword on lit decorated class properties
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {DecoratedNode, isLitClass} from '../util.js';

const needingAccessor = new Set([
  'property',
  'state',
  'query',
  'queryAll',
  'queryAssignedElements',
  'queryAssignedNodes'
]);

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Enforces accessor keyword on lit decorated class properties',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/missing-accessor-keyword.md'
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingAccessorKeyword:
        'Class attribute with @{{decoratorName}} decorator should be ' +
        'preceded by accessor keyword'
    }
  },

  create(context): Rule.RuleListener {
    return {
      ClassDeclaration: (node: ESTree.Class): void => {
        if (isLitClass(node, context)) {
          for (const member of node.body.body) {
            // Members of type PropertyDefinition don't have accessor keyword,
            // it would be of type AccessorProperty instead
            if (member.type == 'PropertyDefinition') {
              const decoratedNode = member as DecoratedNode;

              if (
                decoratedNode.decorators &&
                Array.isArray(decoratedNode.decorators)
              ) {
                for (const decorator of decoratedNode.decorators) {
                  if (
                    decorator.expression.type === 'CallExpression' &&
                    decorator.expression.callee.type === 'Identifier' &&
                    needingAccessor.has(decorator.expression.callee.name)
                  ) {
                    context.report({
                      node: member.key,
                      messageId: 'missingAccessorKeyword',
                      data: {
                        decoratorName: decorator.expression.callee.name
                      },
                      fix: (fixer) =>
                        fixer.insertTextBefore(member.key, 'accessor ')
                    });

                    break;
                  }
                }
              }
            }
          }
        }
      }
    };
  }
};
