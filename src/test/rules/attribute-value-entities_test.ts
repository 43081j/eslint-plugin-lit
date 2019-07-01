/**
 * @fileoverview Disallows unencoded HTML entities in attribute values
 * @author James Garbutt <https://github.com/43081j>
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
    sourceType: 'module',
    ecmaVersion: 2015
  }
});

ruleTester.run('attribute-value-entities', rule, {
  valid: [
    {code: 'html`foo bar`'},
    {code: 'html`<x-foo attr="bar"></x-foo>`'},
    {code: 'html`<x-foo attr="bar&amp;baz"></x-foo>`'},
    {code: 'html`<x-foo attr="bar&#52;baz"></x-foo>`'},
    {code: 'html`<x-foo attr="bar&gt;baz"></x-foo>`'},
    {code: "html`<x-foo attr=${'>'}></x-foo>`"},
    {code: 'html`<x-foo attr="()"></x-foo>`'},
    {code: 'html`<x-foo attr></x-foo>`'},
    {code: 'html`<svg viewBox="0 0 48 48"></svg>`'},
    {code: 'html`<svg xlink:href="abc"></svg>`'}
  ],

  invalid: [
    {
      code: 'html`<x-foo attr=">"></x-foo>`',
      errors: [
        {
          message:
            'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<x-foo attr="<"></x-foo>`',
      errors: [
        {
          message:
            'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: 'html`<x-foo attr="&"></x-foo>`',
      errors: [
        {
          message:
            'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: "html`<x-foo attr='\"'></x-foo>`",
      errors: [
        {
          message:
            'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    },
    {
      code: "html`<x-foo attr='>'></x-foo>`",
      errors: [
        {
          message:
            'Attribute values may not contain unencoded HTML ' +
            'entities, e.g. use `&gt;` instead of `>`',
          line: 1,
          column: 5
        }
      ]
    }
  ]
});
