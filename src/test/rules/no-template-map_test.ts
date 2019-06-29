/**
 * @fileoverview Disallows array `.map` in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-template-map');
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

ruleTester.run('no-template-map', rule, {
  valid: [
    {code: 'html`foo ${someVar} bar`'},
    {code: 'html`foo bar`'},
    {code: 'const m = a.map(i => html`foo ${i}`); html`<div>${m}</div>`;'}
  ],

  invalid: [
    {
      code: 'html`foo ${a.map(i => i)}`',
      errors: [
        {
          messageId: 'noMap',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${a.map(i => html`bar ${i}`)}`',
      errors: [
        {
          messageId: 'noMap',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${a.b.c.map(i => i)}`',
      errors: [
        {
          messageId: 'noMap',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${[1, 2, 3].map(i => i)}`',
      errors: [
        {
          messageId: 'noMap',
          line: 1,
          column: 12
        }
      ]
    }
  ]
});
