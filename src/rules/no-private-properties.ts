/**
 * @fileoverview Detects usages of "non-public" properties
 * @author Michael Stramel <https://github.com/stramel>
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
      description: 'Detects usages of "non-public" properties',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-private-properties.md'
    },
    messages: {
      unsupported: 'TODO'
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefix: {type: 'string'}
        },
        additionalProperties: false
      }
    ]
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const options = {
      prefix: '_',
      ...context.options[0]
    };

    const bindings = ['.', '?', '@'];

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
              // eslint-disable-next-line guard-for-in
              for (const attr in element.attribs) {
                const loc = analyzer.getLocationForAttribute(element, attr);

                if (!loc) {
                  continue;
                }

                const hasBinding = bindings.includes(attr.slice(0, 1));
                const normalizedAttr = hasBinding ? attr.slice(1) : attr;

                console.log(attr, hasBinding, normalizedAttr);

                if (normalizedAttr.startsWith(options.prefix)) {
                  context.report({
                    loc,
                    messageId: 'unsupported'
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
