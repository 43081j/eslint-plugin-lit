/**
 * @fileoverview Disallows redundant literal values in templates
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer.js';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows redundant literal values in templates',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-useless-template-literals.md'
    },
    schema: [],
    messages: {
      doNotSubstituteTextBinding:
        'Literals must not be substituted into text bindings',
      doNotSubstituteAttributes:
        'Literals must not be substituted into ' +
        'attributes, set it directly instead (e.g. ' +
        'attr="value")'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();
    const isAttr = /^[^\.\?]/;
    const endsWithAttr = /=['"]?$/;

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    const getExprAfterPosition = (
      pos: ESTree.SourceLocation,
      node: ESTree.TaggedTemplateExpression
    ): ESTree.Expression | null => {
      for (const expr of node.quasi.expressions) {
        if (
          expr.loc &&
          expr.loc.start.line === pos.start.line &&
          expr.loc.start.column > pos.start.column &&
          ((expr.loc.end.line === pos.end.line &&
            expr.loc.end.column <= pos.end.column) ||
            expr.loc.end.line < pos.end.line)
        ) {
          return expr;
        }
      }
      return null;
    };

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

          for (let i = 0; i < node.quasi.expressions.length; i++) {
            const expr = node.quasi.expressions[i];
            if (
              expr.type === 'Literal' &&
              !endsWithAttr.test(node.quasi.quasis[i].value.raw)
            ) {
              context.report({
                node: expr,
                messageId: 'doNotSubstituteTextBinding'
              });
            }
          }

          analyzer.traverse({
            enterElement: (element): void => {
              // eslint-disable-next-line guard-for-in
              for (const attr in element.attribs) {
                const loc = analyzer.getLocationForAttribute(
                  element,
                  attr,
                  source
                );

                if (!loc) {
                  continue;
                }

                const expr = getExprAfterPosition(loc, node);

                if (isAttr.test(attr) && expr?.type === 'Literal') {
                  context.report({
                    node: expr,
                    messageId: 'doNotSubstituteAttributes'
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
