/**
 * @fileoverview Disallows properties shadowed as class field
 * @author Michel Langeveld <https://github.com/michellangeveld>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/no-classfield-shadowing.js';
import {RuleTester} from 'eslint';
import parser from '@babel/eslint-parser';
import {parser as tsParser} from 'typescript-eslint';

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
    plugins: [
      [
        '@babel/plugin-proposal-decorators',
        {
          version: '2023-11'
        }
      ]
    ]
  }
};

ruleTester.run('no-classfield-shadowing', rule, {
  valid: [
    `class MyElement extends LitElement {
      static properties = {
        foo: { type: String }
      }
    }`,
    `class MyElement extends LitElement {
      foo;
      properties = {
        foo: { type: String }
      }
    }`,
    `class MyElement {
      foo;
      properties = {
        foo: { type: String }
      }
    }`,
    {
      code: `class MyElement extends LitElement {
        @property()
        foo;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class MyElement extends LitElement {
        @property()
        accessor foo;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class MyElement extends LitElement {
        declare foo;
        static properties = {
          foo: { type: String }
        };
      }`,
      languageOptions: {
        parser: tsParser
      }
    }
  ],

  invalid: [
    {
      code: `class MyElement extends LitElement {
        foo;
        static properties = {foo: {}}
      }`,
      errors: [
        {
          messageId: 'noClassfieldShadowing',
          data: {prop: 'foo'},
          line: 3,
          column: 30
        }
      ]
    },
    {
      code: `class MyElement extends SubClass {
        foo;
        static properties = {foo: {}}
      }`,
      errors: [
        {
          messageId: 'noClassfieldShadowing',
          data: {prop: 'foo'},
          line: 3,
          column: 30
        }
      ],
      settings: {
        lit: {
          elementBaseClasses: ['SubClass']
        }
      }
    },
    {
      code: `class MyElement extends LitElement {
        static properties = {foo: {}}
        foo;
      }`,
      errors: [
        {
          messageId: 'noClassfieldShadowing',
          data: {prop: 'foo'},
          line: 2,
          column: 30
        }
      ]
    },
    {
      code: `class MyElement extends LitElement {
        foo;
        static get properties() { return { foo: {}}};
      }`,
      errors: [
        {
          messageId: 'noClassfieldShadowing',
          data: {prop: 'foo'},
          line: 3,
          column: 44
        }
      ]
    },
    {
      code: `class MyElement extends LitElement {
        static get properties() { return { foo: {}}};
        foo;
      }`,
      errors: [
        {
          messageId: 'noClassfieldShadowing',
          data: {prop: 'foo'},
          line: 2,
          column: 44
        }
      ]
    },
    {
      code: `class Foo extends A(LitElement) {
        foo;
        static properties = { foo: {} };
      }`,
      errors: [
        {
          messageId: 'noClassfieldShadowing',
          data: {prop: 'foo'},
          line: 3,
          column: 31
        }
      ]
    },
    {
      code: `class Foo extends A(B(LitElement)) {
        foo;
        static properties = { foo: {} };
      }`,
      errors: [
        {
          messageId: 'noClassfieldShadowing',
          data: {prop: 'foo'},
          line: 3,
          column: 31
        }
      ]
    },
    {
      code: `class Foo extends A(B(C(LitElement))) {
        foo;
        static properties = { foo: {} };
      }`,
      errors: [
        {
          messageId: 'noClassfieldShadowing',
          data: {prop: 'foo'},
          line: 3,
          column: 31
        }
      ]
    }
  ]
});
