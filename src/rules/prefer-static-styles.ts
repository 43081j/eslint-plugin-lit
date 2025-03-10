/**
 * @fileoverview Enforces the use of static styles in elements
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer.js';
import {isLitClass} from '../util.js';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Enforces the use of static styles in elements',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/prefer-static-styles.md'
    },
    schema: [
      {
        enum: ['always', 'never']
      }
    ],
    messages: {
      always: 'Static styles should be used instead of inline style tags',
      never: 'Inline style tags should be used instead of static styles'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();
    const prefer = context.options[0] !== 'never';

    return {
      'ClassExpression,ClassDeclaration': (node: ESTree.Class): void => {
        if (!prefer && isLitClass(node)) {
          for (const member of node.body.body) {
            if (
              member.type === 'MethodDefinition' &&
              member.kind === 'get' &&
              member.static &&
              member.key.type === 'Identifier' &&
              member.key.name === 'styles'
            ) {
              context.report({
                node: member,
                messageId: 'never'
              });
            }

            if (
              member.type === 'PropertyDefinition' &&
              member.static &&
              member.key.type === 'Identifier' &&
              member.key.name === 'styles'
            ) {
              context.report({
                node: member,
                messageId: 'never'
              });
            }
          }
        }
      },
      AssignmentExpression: (node: ESTree.AssignmentExpression): void => {
        if (
          !prefer &&
          node.left.type === 'MemberExpression' &&
          node.left.property.type === 'Identifier' &&
          node.left.property.name === 'adoptedStylesheets'
        ) {
          context.report({
            node,
            messageId: 'never'
          });
        }
      },
      TaggedTemplateExpression: (
        node: ESTree.TaggedTemplateExpression
      ): void => {
        if (node.tag.type === 'Identifier' && node.tag.name === 'html') {
          const analyzer = TemplateAnalyzer.create(node);

          if (prefer) {
            analyzer.traverse({
              enterElement(node) {
                if (node.tagName === 'style' && node.sourceCodeLocation) {
                  const loc = analyzer.resolveLocation(
                    node.sourceCodeLocation,
                    source
                  );
                  if (loc) {
                    context.report({
                      loc,
                      messageId: 'always'
                    });
                  }
                }
              }
            });
          }
        }
      }
    };
  }
};
