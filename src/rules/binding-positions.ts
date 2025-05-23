/**
 * @fileoverview Disallows invalid binding positions in templates
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows invalid binding positions in templates',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/binding-positions.md'
    },
    schema: [],
    messages: {
      noBindingTagName: 'Bindings cannot be used in place of tag names.',
      noBindingAttributeName:
        'Bindings cannot be used in place of attribute names.',
      noBindingSelfClosingTag:
        'Bindings at the end of a self-closing tag must be' +
        ' followed by a space or quoted',
      noBindingHTMLComment: 'Bindings cannot be used inside HTML comments.'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const tagPattern = /<\/?$/;
    const attrPattern = /^=/;
    const selfClosingPattern = /^\/>/;

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    /**
     * Determines if a given TemplateElement is contained within
     * a HTML comment.
     *
     * @param {ESTree.TemplateElement=} expr Expression to test
     * @return {boolean}
     */
    function isInsideComment(
      expr: ESTree.TemplateElement | undefined
    ): boolean {
      return (
        expr !== undefined &&
        expr.value.raw.lastIndexOf('<!--') > expr.value.raw.lastIndexOf('-->')
      );
    }

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
          for (let i = 0; i < node.quasi.expressions.length; i++) {
            const expr = node.quasi.expressions[i];
            const prev = node.quasi.quasis[i];
            const next = node.quasi.quasis[i + 1];
            if (tagPattern.test(prev.value.raw)) {
              context.report({
                node: expr,
                messageId: 'noBindingTagName'
              });
            } else if (next && attrPattern.test(next.value.raw)) {
              context.report({
                node: expr,
                messageId: 'noBindingAttributeName'
              });
            } else if (next && selfClosingPattern.test(next.value.raw)) {
              context.report({
                node: expr,
                messageId: 'noBindingSelfClosingTag'
              });
            } else if (isInsideComment(prev)) {
              context.report({
                node: expr,
                messageId: 'noBindingHTMLComment'
              });
            }
          }
        }
      }
    };
  }
};
