/**
 * @fileoverview Disallows use of native attributes as properties
 * @author Pascal Schilp <https://github.com/thepassle>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/no-native-attributes');
import { RuleTester } from 'eslint';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest'
  }
});

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
          messageId: 'noNativeAttributes'
        }
      ]
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
          message:
            'The title attribute is a native global attribute. ' +
            'Using it as a property could have unintended side-effects.'
        }
      ]
    }
  ]
});
