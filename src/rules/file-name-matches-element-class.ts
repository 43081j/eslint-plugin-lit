/**
 * @fileoverview Disallow different name between
 * the class of the lit element and the filename
 * @author Julien Rousseau <https://github.com/RoXuS>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {hasFileName, isValidFilename} from '../util';

const isLitElementClass = (
  args: Array<ESTree.SpreadElement | ESTree.Expression>
): boolean => {
  return args.some((a) => {
    if (a.type === 'CallExpression') {
      return isLitElementClass(a.arguments);
    } else if (a.type === 'Identifier' && a.name === 'LitElement') {
      return true;
    }
    return false;
  });
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce usage of the same element class name and filename'
    },
    schema: [
      {
        type: 'object',
        properties: {
          transform: {
            oneOf: [
              {
                enum: ['none', 'snake', 'kebab', 'pascal']
              },
              {
                type: 'array',
                items: {
                  enum: ['none', 'snake', 'kebab', 'pascal']
                },
                minItems: 1,
                maxItems: 4
              }
            ]
          }
        }
      }
    ]
  },
  create(context): Rule.RuleListener {
    if (!hasFileName(context)) return {};
    return {
      'ClassDeclaration, ClassExpression': (node: ESTree.Class): void => {
        if (
          node.superClass?.type === 'CallExpression' &&
          isLitElementClass(node.superClass.arguments)
        ) {
          isValidFilename(context, node, node.id?.name || '');
        }
      },
      [`:matches(ClassDeclaration, ClassExpression)[superClass.name=/.*LitElement.*/]`]:
        (node: ESTree.Class): void => {
          isValidFilename(context, node, node.id?.name || '');
        }
    };
  }
};

export = rule;
