/**
 * @fileoverview Enforces the use of static styles in elements
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

// TODO (43081j): hope that one day estree supports class fields...
// they've existed for a while, i suppose its just behind.
// Remove this when they do!
interface ClassProperty extends ESTree.BaseNode {
  type: 'ClassProperty';
  key: ESTree.Expression;
  value: ESTree.Expression;
  computed: boolean;
  static: boolean;
}

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Enforces the use of static styles in elements',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/prefer-static-styles.md'
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
        if (
          !prefer &&
          node.superClass &&
          node.superClass.type === 'Identifier' &&
          node.superClass.name === 'LitElement'
        ) {
          for (const member of node.body.body) {
            const asProp = (member as unknown) as ClassProperty;

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
              asProp.type === 'ClassProperty' &&
              asProp.static &&
              asProp.key.type === 'Identifier' &&
              asProp.key.name === 'styles'
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

export = rule;
