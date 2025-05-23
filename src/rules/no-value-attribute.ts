/**
 * @fileoverview Detects usages of the `value` attribute
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer.js';
import {isExpressionPlaceholder} from '../util.js';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Detects usages of the `value` attribute where the ' +
        'equivalent property should be used instead',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-value-attribute.md'
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferProperty:
        'The `value` attribute only defines the initial value ' +
        'rather than permanently binding; you should set the `value` ' +
        'property instead via `.value`'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();
    const warnedTags = ['input'];

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      TaggedTemplateExpression: (node: ESTree.Node): void => {
        if (
          node.type === 'TaggedTemplateExpression' &&
          node.tag.type === 'Identifier' &&
          node.tag.name === 'html'
        ) {
          const analyzer = TemplateAnalyzer.create(node);

          analyzer.traverse({
            enterElement: (element): void => {
              if (
                warnedTags.includes(element.tagName) &&
                'value' in element.attribs &&
                isExpressionPlaceholder(element.attribs['value'])
              ) {
                const loc = analyzer.getLocationForAttribute(
                  element,
                  'value',
                  source
                );

                if (loc) {
                  const range = source.getIndexFromLoc(loc.start);

                  context.report({
                    loc,
                    messageId: 'preferProperty',
                    fix: (fixer) =>
                      fixer.insertTextBeforeRange([range, range], '.')
                  });
                }
              }
            }
          });
        }
      }
    };
  }
};
