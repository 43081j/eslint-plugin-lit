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
    'html`foo ${someVar} bar`',
    'html`foo bar`',
    'html`<foo .prop=${"literal"}></foo>`',
    'html`<foo .prop=${\n"literal"\n}\n></foo>`',
    'html`<foo .prop="${"literal"}"></foo>`',
    'html`<foo\nattr="foo"\n.prop=${"literal"}></foo>`'
  ],

  invalid: [
    {
      code: 'html`foo ${123} bar`',
      errors: [
        {
          messageId: 'doNotSubstituteTextBinding',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo\n<foo attr=${"abc"}></foo>\nbar`',
      errors: [
        {
          messageId: 'doNotSubstituteAttributes',
          line: 2,
          column: 13
        }
      ]
    },
    {
      code: 'html`foo ${"abc"} ${true} bar`',
      errors: [
        {
          messageId: 'doNotSubstituteTextBinding',
          line: 1,
          column: 12
        },
        {
          messageId: 'doNotSubstituteTextBinding',
          line: 1,
          column: 21
        }
      ]
    },
    {
      code: 'html`<foo attr=${"abc"}></foo>`',
      errors: [
        {
          messageId: 'doNotSubstituteAttributes',
          line: 1,
          column: 18
        }
      ]
    }
  ]
});
