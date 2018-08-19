/**
 * @fileoverview Disallows duplicate names in template bindings
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
      description: 'Disallows duplicate names in template bindings',
      category: 'Best Practices',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/template-duplicate-bindings.md'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const propertyPattern = /\b([\.@\?])?([\w\-]+)([=\s>])/g;
    const tagPattern = /<[^\/][^>]*>/g; // todo: handle `foo=">"`

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
          const html = node.quasi.quasis
            .map((q): string => q.value.raw)
            .join('{{__lint__}}');

          const tags = html.match(tagPattern);

          if (tags) {
            for (const tag of tags) {
              const pattern = new RegExp(propertyPattern.source, 'g');
              let match: RegExpExecArray|null;
              let seen: string[] = [];

              while ((match = pattern.exec(tag)) !== null) {
                if (seen.includes(match[2])) {
                  // todo: maybe report column of this property
                  context.report({
                    node: node,
                    message: `Duplicate bindings are not allowed, "${match[2]}" was set multiple times.`
                  });
                } else {
                  seen.push(match[2]);
                }
              }
            }
          }
        }
      }
    };
  }
};

export = rule;
