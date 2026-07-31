/**
 * @fileoverview Enforces that the id parameter is defined in @lit/localize msg() calls
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {Rule, Scope} from 'eslint';
import * as ESTree from 'estree';
import crypto from 'crypto';

export const idGenerator = {
  generate(): string {
    return crypto.randomBytes(12).toString('base64');
  }
};

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Enforces that the id parameter is defined in @lit/localize msg() calls',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/require-id-localization-msg.md'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          onlyForTemplateLiterals: {type: 'boolean'},
          autoFixWithRandomId: {type: 'boolean'}
        },
        additionalProperties: false
      }
    ],
    defaultOptions: [
      {
        onlyForTemplateLiterals: false,
        autoFixWithRandomId: false
      }
    ],
    messages: {
      missingId: 'The @lit/localize msg() function must have an id parameter'
    }
  },

  create(context): Rule.RuleListener {
    let importedMsgName: string | null = null;

    function findVariableInScope(
      name: string,
      scope: Scope.Scope
    ): Scope.Variable | null {
      let currentScope: Scope.Scope | null = scope;

      while (currentScope) {
        if (currentScope.set.has(name)) {
          return currentScope.set.get(name) ?? null;
        }

        currentScope = currentScope.upper;
      }

      return null;
    }

    return {
      ImportDeclaration: (node: ESTree.ImportDeclaration): void => {
        if (node.source.value === '@lit/localize') {
          for (const specifier of node.specifiers) {
            if (
              specifier.type === 'ImportSpecifier' &&
              specifier.imported.type === 'Identifier' &&
              specifier.imported.name === 'msg'
            ) {
              importedMsgName = specifier.local.name;
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
          // Check if it's the imported msg and not a shadowed one
          // Let's re-verify scope if possible
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
            const hasId =
              node.arguments.length >= 2 &&
              node.arguments[1].type === 'ObjectExpression' &&
              node.arguments[1].properties.some(
                (prop) =>
                  prop.type === 'Property' &&
                  prop.key.type === 'Identifier' &&
                  prop.key.name === 'id'
              );

            const onlyForTemplateLiterals =
              context.options[0]?.onlyForTemplateLiterals ?? false;

            if (
              onlyForTemplateLiterals &&
              node.arguments.length >= 1 &&
              node.arguments[0].type !== 'TemplateLiteral' &&
              node.arguments[0].type !== 'TaggedTemplateExpression'
            ) {
              return;
            }

            if (!hasId) {
              const autoFixWithRandomId =
                context.options[0]?.autoFixWithRandomId ?? false;

              context.report({
                node,
                messageId: 'missingId',
                fix: autoFixWithRandomId
                  ? (fixer) => {
                    const randomId = idGenerator.generate();
                    const idProperty = `id: '${randomId}'`;

                    if (
                      node.arguments.length >= 2 &&
                      node.arguments[1].type === 'ObjectExpression'
                    ) {
                      const obj = node.arguments[1];
                      const lastProp =
                        obj.properties[obj.properties.length - 1];
                      if (lastProp) {
                        return fixer.insertTextAfter(
                          lastProp,
                          `, ${idProperty}`
                        );
                      } else {
                        return fixer.replaceText(obj, `{${idProperty}}`);
                      }
                    } else {
                      const firstArg = node.arguments[0];
                      return fixer.insertTextAfter(
                        firstArg,
                        `, {${idProperty}}`
                      );
                    }
                  }
                  : null
              });
            }
          }
        }
      }
    };
  }
};
