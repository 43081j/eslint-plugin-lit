/**
 * @fileoverview Disallows a set of attributes from being used in templates
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
      description: 'Disallows a set of attributes from being used in templates',
      category: 'Best Practices',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/attribute-denylist.md'
    },
    schema: {
      type: 'array',
      items: {
        type: 'string'
      },
      uniqueItems: true
    },
    messages: {
      denied: 'The attribute "{{ attr }}" is not allowed in templates'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();
    const userDisallowedAttributes = context.options as string[];
    const disallowedAttributes = userDisallowedAttributes.map((attr) =>
      attr.toLowerCase()
    );

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
              // eslint-disable-next-line guard-for-in
              for (const attr in element.attribs) {
                let attrNormalised = attr.toLowerCase();

                if (attrNormalised.startsWith('?')) {
                  attrNormalised = attrNormalised.slice(1);
                }

                if (disallowedAttributes.includes(attrNormalised)) {
                  const loc = analyzer.getLocationForAttribute(
                    element,
                    attr,
                    source
                  );

                  if (loc) {
                    context.report({
                      loc: loc,
                      messageId: 'denied',
                      data: {attr: attrNormalised}
                    });
                  }
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
