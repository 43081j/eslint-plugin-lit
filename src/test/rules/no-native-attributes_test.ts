/**
 * @fileoverview Disallows use of native attributes as properties
 * @author Pascal Schilp <https://github.com/thepassle>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/no-native-attributes.js';
import {RuleTester} from 'eslint';
import parser from '@babel/eslint-parser';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest'
    }
  }
});

const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    plugins: [['@babel/plugin-proposal-decorators', {version: '2023-11'}]]
  }
};

ruleTester.run('no-native-attributes', rule, {
  valid: [
    `class Foo extends LitElement {
      static properties = {
        foo: { type: String }
      }
    }`
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        static properties = {
          title: { type: String }
        }
      }`,
      errors: [
        {
          messageId: 'noNativeAttributes',
          data: {prop: 'title'}
        }
      ]
    },
    {
      code: `class Foo extends SubClass {
        static properties = {
          title: { type: String }
        }
      }`,
      errors: [
        {
          messageId: 'noNativeAttributes',
          data: {prop: 'title'}
        }
      ],
      settings: {
        lit: {
          elementBaseClasses: ['SubClass']
        }
      }
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            title: { type: String }
          }
        }
      }`,
      errors: [
        {
          messageId: 'noNativeAttributes',
          data: {prop: 'title'}
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property()
        title;
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 9,
          messageId: 'noNativeAttributes',
          data: {prop: 'title'}
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property()
        accessor title;
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 18,
          messageId: 'noNativeAttributes',
          data: {prop: 'title'}
        }
      ]
    }
  ]
});
