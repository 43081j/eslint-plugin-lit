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
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-legacy-imports.md'
    },
    fixable: 'code',
    schema: [],
    messages: {
      legacyDecorator:
        'Legacy decorators should no longer be used, did you mean to use ' +
        "the '{{replacement}}' decorator from the 'lit/decorators' module?",
      movedDecorator:
        "Decorators should now be imported from the 'lit/decorators' module",
      movedSource:
        'Imported module has moved in lit 2, did you mean ' +
        'to use "{{replacement}}"?'
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
    const movedSources: Array<{ from: RegExp; to: string }> = [
      {from: /^lit-element$/, to: 'lit'},
      {from: /^lit-html$/, to: 'lit'},
      {
        from: /^lit-element\/lib\/updating-element(?:\.js)?$/,
        to: '@lit/reactive-element'
      },
      {
        from: /^lit-html\/directives\/(.+)$/,
        to: 'lit/directives/$1'
      }
    ];

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

        const source = node.source.value;

        if (typeof source === 'string') {
          const mapping = movedSources.find((s) => s.from.test(source));
          if (mapping) {
            const replacement = source.replace(mapping.from, mapping.to);
            context.report({
              node: node.source,
              messageId: 'movedSource',
              data: {
                replacement
              }
            });
          }
        }
      }
    };
  }
};

export = rule;
