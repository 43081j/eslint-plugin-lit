/**
 * @fileoverview Disallows redundant literal values in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-useless-template-literals');
import {RuleTester} from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2015
  }
});

ruleTester.run('no-useless-template-literals', rule, {
  valid: [
    {code: 'html`foo ${someVar} bar`'},
    {code: 'html`foo bar`'},
    {code: 'html`<foo .prop=${"literal"}></foo>`'},
    {code: 'html`<foo .prop=${\n"literal"\n}\n></foo>`'},
    {code: 'html`<foo .prop="${"literal"}"></foo>`'},
    {code: 'html`<foo\nattr="foo"\n.prop=${"literal"}></foo>`'}
  ],

  invalid: [
    {
      code: 'html`foo ${123} bar`',
      errors: [
        {
          message: 'Literals must not be substituted into text bindings',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo\n<foo attr=${"abc"}></foo>\nbar`',
      errors: [
        {
          message:
            'Literals must not be substituted into attributes, ' +
            'set it directly instead (e.g. attr="value")',
          line: 2,
          column: 13
        }
      ]
    },
    {
      code: 'html`foo ${"abc"} ${true} bar`',
      errors: [
        {
          message: 'Literals must not be substituted into text bindings',
          line: 1,
          column: 12
        },
        {
          message: 'Literals must not be substituted into text bindings',
          line: 1,
          column: 21
        }
      ]
    },
    {
      code: 'html`<foo attr=${"abc"}></foo>`',
      errors: [
        {
          message:
            'Literals must not be substituted into attributes, ' +
            'set it directly instead (e.g. attr="value")',
          line: 1,
          column: 18
        }
      ]
    }
  ]
});
