/**
 * @fileoverview Use boolean attribute expressions only with HTML bool attribute
 * @author Alican Erdogan <https://github.com/alicanerdogan>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer';

// Source: https://html.spec.whatwg.org/#attributes-3
const validBooleanHTMLAttributes = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'hidden',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected'
]);

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows usages of invalid boolean attributes',
      category: 'Best Practices',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/boolean-attributes.md'
    },
    schema: [
      {
        type: 'object',
        properties: {
          exclude: {type: 'array', minLength: 0, required: false}
        },
        additionalProperties: false,
        minProperties: 0
      }
    ],
    messages: {
      booleanAttribute:
        'Properties should not be assigned with boolean attribute expressions.'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();
    const config: Partial<{exclude?: string[]}> = context.options[0] || {};

    const exclude = new Set(config.exclude || []);

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

                if (!loc) {
                  continue;
                }

                const hasBooleanAttributeBinding = '?' === attr[0];
                if (!hasBooleanAttributeBinding) {
                  continue;
                }

                const propertyName = attr.slice(1);

                const isExcluded = exclude.has(propertyName);
                if (isExcluded) {
                  continue;
                }

                const isValidBooleanAttribute =
                  validBooleanHTMLAttributes.has(propertyName);

                if (!isValidBooleanAttribute) {
                  context.report({
                    loc,
                    messageId: 'booleanAttribute'
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
