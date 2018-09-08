/**
 * @fileoverview Disallows unencoded HTML entities in attribute values
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
      description: 'Disallows unencoded HTML entities in attribute values',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/attribute-value-entities.md'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here
    const disallowedPattern = /[^\s=]+=('[^"']*"|("[^&<>"]*|'[^&<>']*)[&<>]+)/;

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
            if (disallowedPattern.test(quasi.value.raw)) {
              context.report({
                node: quasi,
                message: 'Attribute values may not contain unencoded HTML ' +
                  'entities, e.g. use `&gt;` instead of `>`'
              });
            }
          }
        }
      }
    };
  }
};

export = rule;
