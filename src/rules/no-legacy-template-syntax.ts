/**
 * @fileoverview Detects usages of legacy binding syntax
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
      description: 'Detects usages of legacy binding syntax',
      category: 'Best Practices',
      url:
        'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-legacy-template-syntax.md'
    },
    messages: {
      unsupported:
        'Legacy lit-extended syntax is unsupported, did you mean to use ' +
        '"{{replacement}}"?'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const legacyEventPattern = /^on-./;

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

                const lastChar = attr.slice(-1);

                if (legacyEventPattern.test(attr)) {
                  const replacement = `@${attr.substr(3)}=`;
                  context.report({
                    loc: loc,
                    messageId: 'unsupported',
                    data: {
                      replacement: replacement
                    }
                  });
                } else if (lastChar === '?' || lastChar === '$') {
                  const prefix = lastChar === '?' ? '?' : '';
                  const replacement = `${prefix}${attr.slice(0, -1)}=`;
                  context.report({
                    loc: loc,
                    messageId: 'unsupported',
                    data: {
                      replacement: replacement
                    }
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
