/**
 * @fileoverview Detects usages of legacy decorators
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-legacy-decorators');
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

const babelParser = require.resolve('babel-eslint');

ruleTester.run('no-legacy-decorators', rule, {
  valid: [
    {code: 'class Foo { }'},
    {
      parser: babelParser,
      code: `class Foo extends LitElement {
        @property({ type: String })
        prop = 'test';
      }`
    },
    {
      parser: babelParser,
      code: `class Foo extends LitElement {
        @state() prop = 'test';
      }`
    }
  ],

  invalid: [
    {
      parser: babelParser,
      code: `class Foo extends LitElement {
        @internalProperty() prop = 'test';
      }`,
      errors: [
        {
          messageId: 'legacyDecorator',
          line: 2,
          column: 9
        }
      ],
      output: `class Foo extends LitElement {
        @state() prop = 'test';
      }`
    },
    {
      parser: babelParser,
      code: `class Foo {
        @internalProperty() prop = 'test';
      }`,
      errors: [
        {
          messageId: 'legacyDecorator',
          line: 2,
          column: 9
        }
      ],
      output: `class Foo {
        @state() prop = 'test';
      }`
    }
  ]
});
