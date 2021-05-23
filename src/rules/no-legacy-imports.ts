/**
 * @fileoverview Detects usages of legacy lit imports
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
      description: 'Detects usages of legacy lit imports',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-legacy-imports.md'
    },
    fixable: 'code',
    messages: {
      legacyDecorator:
        'Legacy decorators should no longer be used, did you mean to use ' +
        "the '{{replacement}}' decorator from the 'lit/decorators' module?",
      movedDecorator:
        "Decorators should now be imported from the 'lit/decorators' module",
      movedSource:
        "Lit imports should come from the 'lit' module rather than" +
        " 'lit-element' or 'lit-html'"
    }
  },

  create(context): Rule.RuleListener {
    const legacyDecorators: Record<string, string> = {
      internalProperty: 'state'
    };
    const movedDecorators = [
      'customElement',
      'eventOptions',
      'property',
      'query',
      'queryAll',
      'queryAssignedNodes',
      'queryAsync'
    ];
    const movedSources = ['lit-element', 'lit-html'];

    return {
      ImportDeclaration: (node: ESTree.ImportDeclaration): void => {
        if (node.source.value === 'lit-element') {
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportSpecifier') {
              const replacement = legacyDecorators[specifier.imported.name];
              if (replacement) {
                context.report({
                  node: specifier,
                  messageId: 'legacyDecorator',
                  data: {replacement}
                });
              } else if (movedDecorators.includes(specifier.imported.name)) {
                context.report({
                  node: specifier,
                  messageId: 'movedDecorator'
                });
              }
            }
          }
        }

        if (
          typeof node.source.value === 'string' &&
          movedSources.includes(node.source.value)
        ) {
          context.report({
            node: node.source,
            messageId: 'movedSource'
          });
        }
      }
    };
  }
};

export = rule;
