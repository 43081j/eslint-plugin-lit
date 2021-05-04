/**
 * @fileoverview Disallows redundant literal values in templates
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows redundant literal values in templates',
      category: 'Best Practices',
      recommended: true,
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-useless-template-literals.md'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const isAttr = /^[^\.\?]/;

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    const getExprAfterPosition = (
      pos: ESTree.SourceLocation,
      node: ESTree.TaggedTemplateExpression
    ): ESTree.Expression | null => {
      for (let i = 0; i < node.quasi.quasis.length; i++) {
        const quasi = node.quasi.quasis[i];
        if (
          quasi.loc &&
          ((pos.start.line > quasi.loc.start.line &&
            pos.end.line < quasi.loc.end.line) ||
            (pos.start.line === quasi.loc.start.line &&
              pos.start.column >= quasi.loc.start.column) ||
            (pos.start.line === quasi.loc.end.line &&
              pos.start.column <= quasi.loc.end.column))
        ) {
          return node.quasi.expressions[i] ?? null;
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
              !node.quasi.quasis[i].value.raw.endsWith('=')
            ) {
              context.report({
                node: expr,
                message:
                  'Literals must not be substituted into text bindings'
              });
            }
          }

          analyzer.traverse({
            enterElement: (element): void => {
              // eslint-disable-next-line guard-for-in
              for (const attr in element.attribs) {
                const loc = analyzer.getLocationForAttribute(element, attr);

                if (!loc) {
                  continue;
                }

                const expr = getExprAfterPosition(loc, node);

                if (isAttr.test(attr) && expr?.type === 'Literal') {
                  context.report({
                    node: expr,
                    message:
                      'Literals must not be substituted into ' +
                      'attributes, set it directly instead (e.g. ' +
                      'attr="value")'
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

export = rule;
