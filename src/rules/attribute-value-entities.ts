/**
 * @fileoverview Disallows unencoded HTML entities in attribute values
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
      description: 'Disallows unencoded HTML entities in attribute values',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/attribute-value-entities.md'
    },
    schema: [],
    messages: {
      unencoded:
        'Attribute values may not contain unencoded HTML ' +
        'entities, e.g. use `&gt;` instead of `>`',
      doubleQuotes:
        'Attributes delimited by double quotes may not contain ' +
        'unencoded double quotes (e.g. `attr="bad"quote"`)',
      singleQuotes:
        'Attributes delimited by single quotes may not contain ' +
        "unencoded single quotes (e.g. `attr='bad'quote'`)"
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();
    const disallowedPattern = /([<>]|&(?!(#\d+|[a-z]+);))/;

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
                const loc = analyzer.getLocationForAttribute(
                  element,
                  attr,
                  source
                );
                const rawValue = analyzer.getRawAttributeValue(element, attr);

                if (!loc || !rawValue?.value) {
                  continue;
                }

                if (disallowedPattern.test(rawValue.value)) {
                  context.report({
                    loc: loc,
                    messageId: 'unencoded'
                  });
                } else if (
                  rawValue.quotedValue?.startsWith('"') &&
                  rawValue.value?.includes('"')
                ) {
                  context.report({
                    loc: loc,
                    messageId: 'doubleQuotes'
                  });
                } else if (
                  rawValue.quotedValue?.startsWith("'") &&
                  rawValue.value?.includes("'")
                ) {
                  context.report({
                    loc: loc,
                    messageId: 'singleQuotes'
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
