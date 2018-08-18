/**
 * @fileoverview Detects usages of legacy binding syntax
 * @author James Garbutt <htttps://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Detects usages of legacy binding syntax',
      category: 'Best Practices',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/template-legacy-binding-syntax.md'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const legacyPropertyPattern = /\b(on\-([\w\-]+)|([\w\-]+)([\$\?]))=/;

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      'TaggedTemplateExpression': (node: ESTree.Node): void => {
        if (node.type === 'TaggedTemplateExpression' &&
            node.tag.type === 'Identifier' &&
            node.tag.name === 'html') {

          for (const quasi of node.quasi.quasis) {
            const val = quasi.value.raw;
            const propPattern = new RegExp(legacyPropertyPattern.source, 'g');
            let propMatch: RegExpExecArray|null;

            // todo: this is pretty dumb, it will complain
            // about prop-like strings which are not in tags
            while ((propMatch = propPattern.exec(val)) !== null) {
              if (propMatch[3]) {
                let replacement = `${propMatch[3]}=`;

                if (propMatch[4] === '?') {
                  replacement = `?${propMatch[3]}=`;
                }

                context.report({
                  node: quasi,
                  message: `Legacy lit-extended syntax is unsupported, did you mean to use "${replacement}"?`
                });
              } else {
                context.report({
                  node: quasi,
                  message: `Legacy lit-extended syntax is unsupported, did you mean to use "@${propMatch[2]}="?`
                });
              }
            }
          }
        }
      }
    };
  }
};

export = rule;
