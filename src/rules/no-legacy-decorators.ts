/**
 * @fileoverview Detects usages of legacy decorators
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
      description: 'Detects usages of legacy decorators',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-legacy-decorators.md'
    },
    fixable: 'code',
    messages: {
      legacyDecorator:
        'Legacy decorators should no longer be used, did you mean to use ' +
        "the '{{replacement}}' decorator from the 'lit/decorators' module?"
    }
  },

  create(context): Rule.RuleListener {
    // TODO (43081j) If this ever contains more than just `internalProperty`,
    // we should do deeper checks, e.g. check the decorator is decorating
    // a property.
    const legacyDecorators: Record<string, string> = {
      internalProperty: 'state'
    };

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
              }
            }
          }
        }
      }
    };
  }
};

export = rule;
