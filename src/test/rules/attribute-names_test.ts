/**
 * @fileoverview Enforces attribute naming conventions
 * @author James Garbutt <https://github.com/43081j>
 */

import rule = require('../../rules/attribute-names');
import {RuleTester} from 'eslint';

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2015
  }
});

const parser = require.resolve('@babel/eslint-parser');
const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    plugins: [['@babel/plugin-proposal-decorators', {version: '2023-11'}]]
  }
};

ruleTester.run('attribute-names', rule, {
  valid: [
    'class Foo {}',
    `class Foo {
      static get properties() {
        return {
          whateverCaseYouWant: {type: String}
        };
      }
    }`,
    `class Foo extends LitElement {
      static get properties() {
        return {
          lowercase: {type: String}
        };
      }
    }`,
    `class Foo extends LitElement {
      static get properties() {
        return {
          internalState: {type: String, state: true}
        };
      }
    }`,
    `class Foo extends LitElement {
      static get properties() {
        return {
          camelCase: {type: String, attribute: 'lowercase'}
        };
      }
    }`,
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: 'camel-case'}
          };
        }
      }`,
      options: [{style: 'dash'}]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: false}
          };
        }
      }`,
      options: [{style: 'dash'}]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: 'camelcase'}
          };
        }
      }`,
      options: [{style: 'none'}]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: false}
          };
        }
      }`,
      options: [{style: 'none'}]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: 'camel_case'}
          };
        }
      }`,
      options: [{style: 'snake'}]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: false}
          };
        }
      }`,
      options: [{style: 'snake'}]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: String })
        lowercase = 'foo';
      }`,
      parser,
      parserOptions
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: String, attribute: 'lowercase' })
        camelCase = 'foo';
      }`,
      parser,
      parserOptions
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: String, attribute: false })
        camelCase = 'foo';
      }`,
      parser,
      parserOptions
    }
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String}
          };
        }
      }`,
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'casedPropertyWithoutAttribute'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String}
          };
        }
      }`,
      options: [{style: 'dash'}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'casedPropertyWithoutAttribute'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: 'stillCamelCase'}
          };
        }
      }`,
      options: [{style: 'dash'}],
      errors: [
        {
          line: 4,
          column: 24,
          messageId: 'casedPropertyStyleDash'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: 'camel-Case'}
          };
        }
      }`,
      options: [{style: 'dash'}],
      errors: [
        {
          line: 4,
          column: 24,
          messageId: 'casedPropertyStyleDash'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String}
          };
        }
      }`,
      options: [{style: 'none'}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'casedPropertyWithoutAttribute'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: 'camelCase'}
          };
        }
      }`,
      options: [{style: 'none'}],
      errors: [
        {
          line: 4,
          column: 24,
          messageId: 'casedPropertyStyleNone'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String}
          };
        }
      }`,
      options: [{style: 'snake'}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'casedPropertyWithoutAttribute'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: 'camel_Case'}
          };
        }
      }`,
      options: [{style: 'snake'}],
      errors: [
        {
          line: 4,
          column: 24,
          messageId: 'casedPropertyStyleSnake'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            camelCase: {type: String, attribute: 'stillCamelCase'}
          };
        }
      }`,
      errors: [
        {
          line: 4,
          column: 24,
          messageId: 'casedAttribute'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: String })
        camelCase = 'foo';
      }`,
      parser,
      parserOptions,
      errors: [
        {
          line: 3,
          column: 9,
          messageId: 'casedPropertyWithoutAttribute'
        }
      ]
    }
  ]
});
