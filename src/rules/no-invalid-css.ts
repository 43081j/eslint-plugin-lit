/**
 * @fileoverview Disallows invalid CSS in templates
 * @author Kristján Oddsson <https://github.com/koddsson>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {validate as validateCSS} from 'csstree-validator';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows invalid CSS in templates',
      recommended: false,
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-invalid-css.md'
    },
    schema: [],
    messages: {
      parseError: 'Template contained invalid CSS syntax, error was: {{ err }}'
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
          node.tag.name === 'css'
        ) {
          const errors = validateCSS(
            node.quasi.quasis.map((quasi) => quasi.value.raw).join('')
          );

          for (const err of errors) {
            context.report({
              loc: {line: err.line, column: err.column},
              messageId: 'parseError',
              data: {err: err.formattedMessage}
            });
          }
        }
      }
    };
  }
};

export = rule;
