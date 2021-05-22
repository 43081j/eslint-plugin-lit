/**
 * @fileoverview Detects usages of legacy decorators
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {BabelDecorator} from '../util';

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
        '"{{replacement}}"?'
    }
  },

  create(context): Rule.RuleListener {
    // TODO (43081j) If this ever contains more than just `internalProperty`,
    // we should do deeper checks, e.g. check the decorator is decorating
    // a property.
    const legacyDecorators: Record<string, string> = {
      internalProperty: 'state'
    };
    const getDecoratorIdentifier = (
      node: BabelDecorator
    ): ESTree.Identifier | null => {
      if (node.expression.type === 'Identifier') {
        return node.expression;
      }
      if (
        node.expression.type === 'CallExpression' &&
        node.expression.callee.type === 'Identifier'
      ) {
        return node.expression.callee;
      }
      return null;
    };

    return {
      Decorator: (node: ESTree.Node): void => {
        const decorator = (node as unknown) as BabelDecorator;
        if (decorator.type === 'Decorator') {
          const ident = getDecoratorIdentifier(decorator);

          if (ident) {
            const replacement = legacyDecorators[ident.name];

            if (replacement) {
              context.report({
                node,
                messageId: 'legacyDecorator',
                data: {
                  replacement
                },
                fix: (fixer) => fixer.replaceText(ident, replacement)
              });
            }
          }
        }
      }
    };
  }
};

export = rule;
