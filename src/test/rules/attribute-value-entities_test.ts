/**
 * @fileoverview Disallows unencoded HTML entities in attribute values
 * @author James Garbutt <htttps://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/attribute-value-entities');
import {RuleTester} from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module'
  }
});

ruleTester.run('attribute-value-entities', rule, {
  valid: [
    {code: 'html`foo bar`'},
    {code: 'html`<x-foo attr="bar" />`'},
    {code: 'html`<x-foo attr=${\'>\'} />`'},
    {code: 'html`<x-foo attr="()" />`'}
  ],

  invalid: [
    {
      code: 'html`<x-foo attr=">" />`',
      errors: [
        {
          message: 'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<x-foo attr="<" />`',
      errors: [
        {
          message: 'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<x-foo attr="&" />`',
      errors: [
        {
          message: 'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<x-foo attr=\'"\' />`',
      errors: [
        {
          message: 'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<x-foo attr=\'>\' />`',
      errors: [
        {
          message: 'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    }
  ]
});
