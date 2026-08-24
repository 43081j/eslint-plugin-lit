/**
 * @fileoverview Disallows definition of "non-public" property
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {rule} from '../../rules/no-private-properties-definition.js';
import {RuleTester} from 'eslint';
import parser from '@babel/eslint-parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2015
    }
  }
});

const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    plugins: [['@babel/plugin-proposal-decorators', {version: '2023-11'}]]
  }
};

const stdOptions = [
  {
    private: '^__',
    protected: '^_'
  }
];

ruleTester.run('no-private-properties-definition', rule, {
  valid: [
    'class Foo {}',
    {
      code: `class Foo {
        static get properties() {
          return {
            __whateverCaseYouWant: {type: String}
          };
        }
      }`,
      options: stdOptions
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            publicProp: {type: String},
          };
        }
      }`
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            __privateState: {state: true},
            publicProperty: {type: String}
          };
        }
      }`,
      options: stdOptions
    },
    {
      code: `class Foo extends LitElement {
        @property()
        prop = 'foo';
      }`,
      options: stdOptions,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @property()
        accessor prop = 'foo';
      }`,
      options: stdOptions,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @property()
        _prop = 'foo';
      }`,
      options: [
        {
          private: '^__'
        }
      ],
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @property()
        __prop = 'foo';
      }`,
      options: [],
      languageOptions: {
        parser,
        parserOptions
      }
    }
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            __prop: {type: String}
          };
        }
      }`,
      options: stdOptions,
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'noPrivate'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            _foo: {type: String}
          };
        }
      }`,
      options: [{protected: '^_'}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'noPrivate'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            $foo: {type: String}
          };
        }
      }`,
      options: [{protected: '^\\$'}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'noPrivate'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property()
        __foo;
      }`,
      options: stdOptions,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 9,
          messageId: 'noPrivate'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property()
        accessor __foo;
      }`,
      options: stdOptions,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 18,
          messageId: 'noPrivate'
        }
      ]
    }
  ]
});
