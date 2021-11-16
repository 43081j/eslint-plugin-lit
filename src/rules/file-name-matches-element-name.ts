/**
 * @fileoverview Disallow different name between
 * the name of the lit element and the filename
 * @author Julien Rousseau <https://github.com/RoXuS>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {hasFileName, isValidFilename} from '../util';

const kebabCaseToPascalCase = (kebabElementName: string): string => {
  const camelCaseElementName = kebabElementName.replace(/-./g, (x) =>
    x[1].toUpperCase()
  );
  return (
    camelCaseElementName.charAt(0).toUpperCase() + camelCaseElementName.slice(1)
  );
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce usage of the same element name and filename'
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
      'CallExpression[callee.name=customElement]': (
        node: ESTree.CallExpression & {
          parent: ESTree.Node & {parent: ESTree.Node};
        }
      ): void => {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'customElement' &&
          node.parent.parent.type === 'ClassDeclaration'
        ) {
          const literalArgument = node.arguments.find(
            (a) => a.type === 'Literal'
          );
          if (
            literalArgument?.type === 'Literal' &&
            literalArgument.value &&
            typeof literalArgument.value === 'string'
          ) {
            isValidFilename(
              context,
              node,
              kebabCaseToPascalCase(literalArgument.value)
            );
          }
        }
      },
      [`CallExpression[callee.property.name=define]:matches([callee.object.type=Identifier][callee.object.name=customElements],[callee.object.type=MemberExpression][callee.object.property.name=customElements]):exit`]:
        (node: ESTree.CallExpression): void => {
          if (node.callee.type === 'MemberExpression') {
            const literalArgument = node.arguments.find(
              (a) => a.type === 'Literal'
            );
            if (
              literalArgument?.type === 'Literal' &&
              literalArgument.value &&
              typeof literalArgument.value === 'string'
            ) {
              isValidFilename(
                context,
                node,
                kebabCaseToPascalCase(literalArgument.value)
              );
            }
          }
        }
    };
  }
};

export = rule;
