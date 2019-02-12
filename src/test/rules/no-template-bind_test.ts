/**
 * @fileoverview Disallows arrow functions and `.bind` in templates
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-template-bind');
import {RuleTester} from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module'
  }
});

ruleTester.run('no-template-bind', rule, {
  valid: [
    {code: 'html`foo ${someVar} bar`'},
    {code: 'html`foo bar`'}
  ],

  invalid: [
    {
      code: 'html`foo ${() => {}} bar`',
      errors: [
        {
          message: 'Arrow functions and `.bind` must not be used in templates, a method should be passed directly like `${this.myMethod}` as it will be bound automatically.',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${() => true} bar`',
      errors: [
        {
          message: 'Arrow functions and `.bind` must not be used in templates, a method should be passed directly like `${this.myMethod}` as it will be bound automatically.',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${function() { }} bar`',
      errors: [
        {
          message: 'Arrow functions and `.bind` must not be used in templates, a method should be passed directly like `${this.myMethod}` as it will be bound automatically.',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${this.foo.bind(this)} bar`',
      errors: [
        {
          message: 'Arrow functions and `.bind` must not be used in templates, a method should be passed directly like `${this.myMethod}` as it will be bound automatically.',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${foo ? function() { } : bar} bar`',
      errors: [
        {
          message: 'Arrow functions and `.bind` must not be used in templates, a method should be passed directly like `${this.myMethod}` as it will be bound automatically.',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${foo ? bar : function() { }} bar`',
      errors: [
        {
          message: 'Arrow functions and `.bind` must not be used in templates, a method should be passed directly like `${this.myMethod}` as it will be bound automatically.',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${foo ? (() => {}) : bar} bar`',
      errors: [
        {
          message: 'Arrow functions and `.bind` must not be used in templates, a method should be passed directly like `${this.myMethod}` as it will be bound automatically.',
          line: 1,
          column: 12
        }
      ]
    },
    {
      code: 'html`foo ${foo ? bar : (() => {})} bar`',
      errors: [
        {
          message: 'Arrow functions and `.bind` must not be used in templates, a method should be passed directly like `${this.myMethod}` as it will be bound automatically.',
          line: 1,
          column: 12
        }
      ]
    }
  ]
});
