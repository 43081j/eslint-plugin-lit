/**
 * @fileoverview Disallows tailwind button components
 * @author Will Johnson
 */


import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const tailwindButtonClasses = [
  'button',
  'button-shell',
  'button-disabled',
  'button-large',
  'button-medium ',
  'button-small',
  'button-x-small',
  'button-icon',
  'button-primary',
  'button-secondary',
  'button-tertiary',
  'button-plain',
  'button-outline',
  'button-destructive',
  'button-media',
  'button-brand',
  'button-success',
  'button-plain-inverted'
];

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows tailwind button usage',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/tailwind-button-usage.md'
    },
    schema: [],
    messages: {
      invalidTailwindUsage:
        'Tailwind component for button is not actively maintained. Please use the button template.'
    }
  },

  create(context): Rule.RuleListener {
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
                element.attribs['class']
                  .split(' ')
                  .some((className) =>
                    tailwindButtonClasses.includes(className)
                  )
              ) {
                context.report({
                  node,
                  messageId: 'invalidTailwindUsage'
                });
              }
            }
          });
        }
      }
    };
  }
};

export = rule;
