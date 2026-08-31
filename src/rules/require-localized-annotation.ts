/**
 * @fileoverview Requires @localized() annotation on classes using msg() from @lit/localize
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {findVariableInScope} from '../util.js';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Requires that a class has @localized() annotation when using msg() from @lit/localize',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/require-localized-annotation.md'
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingLocalized:
        'Classes using msg() from @lit/localize must have the @localized() decorator'
    }
  },

  create(context): Rule.RuleListener {
    let importedMsgName: string | null = null;
    let importedLocalizedName: string | null = null;
    let litLocalizeImportNode: ESTree.ImportDeclaration | null = null;
    const reportedClasses = new Set<ESTree.Node>();

    function classHasLocalizedDecorator(
      node: ESTree.Class
    ): boolean {
      const decorators = (
        node as ESTree.Class & {decorators?: ESTree.Node[]}
      ).decorators;

      if (!decorators) {
        return false;
      }

      for (const decorator of decorators) {
        const dec = decorator as ESTree.Node & {expression?: ESTree.Node};
        const expr = dec.expression;
        if (
          expr &&
          expr.type === 'CallExpression' &&
          expr.callee.type === 'Identifier' &&
          expr.callee.name === importedLocalizedName
        ) {
          return true;
        }
      }

      return false;
    }

    function findEnclosingClass(
      node: ESTree.Node & Rule.NodeParentExtension
    ): ESTree.Class | null {
      let current: ESTree.Node & Rule.NodeParentExtension =
        node.parent as ESTree.Node & Rule.NodeParentExtension;
      while (current) {
        if (
          current.type === 'ClassDeclaration' ||
          current.type === 'ClassExpression'
        ) {
          return current as ESTree.Class;
        }
        if (!('parent' in current) || !current.parent) {
          break;
        }
        current = current.parent as ESTree.Node & Rule.NodeParentExtension;
      }
      return null;
    }

    return {
      ImportDeclaration: (node: ESTree.ImportDeclaration): void => {
        if (node.source.value === '@lit/localize') {
          litLocalizeImportNode = node;
          for (const specifier of node.specifiers) {
            if (
              specifier.type === 'ImportSpecifier' &&
              specifier.imported.type === 'Identifier'
            ) {
              if (specifier.imported.name === 'msg') {
                importedMsgName = specifier.local.name;
              }
              if (specifier.imported.name === 'localized') {
                importedLocalizedName = specifier.local.name;
              }
            }
          }
        }
      },
      CallExpression: (node: ESTree.CallExpression): void => {
        if (
          importedMsgName &&
          node.callee.type === 'Identifier' &&
          node.callee.name === importedMsgName
        ) {
          const variable = findVariableInScope(
            importedMsgName,
            context.sourceCode.getScope(node)
          );
          if (
            variable &&
            variable.defs.some(
              (d) =>
                d.type === 'ImportBinding' &&
                (d.parent as ESTree.ImportDeclaration).source.value ===
                  '@lit/localize'
            )
          ) {
            const enclosingClass = findEnclosingClass(
              node as ESTree.CallExpression & Rule.NodeParentExtension
            );
            if (
              enclosingClass &&
              !reportedClasses.has(enclosingClass) &&
              !classHasLocalizedDecorator(enclosingClass)
            ) {
              reportedClasses.add(enclosingClass);
              const reportNode =
                enclosingClass.type === 'ClassDeclaration' && enclosingClass.id
                  ? enclosingClass.id
                  : enclosingClass;
              context.report({
                node: reportNode,
                messageId: 'missingLocalized',
                fix: (fixer) => {
                  const fixes: Rule.Fix[] = [];

                  // Add localized to the existing @lit/localize import
                  if (litLocalizeImportNode && !importedLocalizedName) {
                    const lastSpecifier =
                      litLocalizeImportNode.specifiers[
                        litLocalizeImportNode.specifiers.length - 1
                      ];
                    if (lastSpecifier) {
                      fixes.push(
                        fixer.insertTextAfter(lastSpecifier, ', localized')
                      );
                    }
                  }

                  // Add @localized() decorator before the class
                  const sourceCode = context.sourceCode;
                  const classParent = (
                    enclosingClass as ESTree.Node & Rule.NodeParentExtension
                  ).parent;
                  // Use the export statement as insertion target if present
                  const insertTarget =
                    classParent &&
                    (classParent.type === 'ExportDefaultDeclaration' ||
                      classParent.type === 'ExportNamedDeclaration')
                      ? classParent
                      : enclosingClass;
                  const targetLine =
                    sourceCode.lines[insertTarget.loc!.start.line - 1];
                  const beforeTarget = targetLine.substring(
                    0,
                    insertTarget.loc!.start.column
                  );
                  // Keep indentation
                  if (/^[ \t]*$/.test(beforeTarget)) {
                    fixes.push(
                      fixer.insertTextBefore(
                        insertTarget,
                        '@localized()\n' + beforeTarget
                      )
                    );
                  } else {
                    fixes.push(
                      fixer.insertTextBefore(
                        insertTarget,
                        '@localized() '
                      )
                    );
                  }

                  return fixes;
                }
              });
            }
          }
        }
      }
    };
  }
};
