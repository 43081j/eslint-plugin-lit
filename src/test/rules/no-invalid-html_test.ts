/**
 * @fileoverview Disallows invalid HTML in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-invalid-html');
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

ruleTester.run('no-invalid-html', rule, {
  valid: [
    // Duplicate attrs rule handles this
    'html`<x-foo bar bar></x-foo>`',
    'html`foo bar`',
    'html`<x-foo bar=${true}></x-foo>`',
    'html`<hr>`',
    'html`<hr />`'
  ],

  invalid: [
    {
      code: 'html`<x-foo />`',
      errors: [
        {
          messageId: 'parseError',
          data: {err: 'non-void-html-element-start-tag-with-trailing-solidus'},
          line: 1,
          column: 6
        }
      ]
    },
    {
      code: 'html`<x-foo attr=">`',
      errors: [
        {
          messageId: 'parseError',
          data: {
            err: 'eof-in-tag'
          },
          line: 1,
          column: 20
        }
      ]
    },
    {
      code: 'html`<x-foo invalid"attr=${true}></x-foo>`',
      errors: [
        {
          messageId: 'parseError',
          data: {err: 'unexpected-character-in-attribute-name'},
          line: 1,
          column: 20
        }
      ]
    },
    {
      code: 'html`<x-foo></x-foo attr>`',
      errors: [
        {
          messageId: 'parseError',
          data: {err: 'end-tag-with-attributes'},
          line: 1,
          column: 25
        }
      ]
    },
    {
      code: 'html`<x-foo attr=${true}><x-bar foo="${true}></x-bar></x-foo>`',
      errors: [
        {
          messageId: 'parseError',
          data: {err: 'eof-in-tag'},
          line: 1,
          column: 62
        }
      ]
    },
    {
      code: 'html`<x-foo x=5y=6></x-foo>`',
      errors: [
        {
          messageId: 'parseError',
          data: {err: 'unexpected-character-in-unquoted-attribute-value'},
          line: 1,
          column: 17
        }
      ]
    }
  ]
});
