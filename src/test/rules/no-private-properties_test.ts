/**
 * @fileoverview Disallows usages of "non-public" property bindings
 * @author Michael Stramel <https://github.com/stramel>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {rule} from '../../rules/no-private-properties.js';
import {RuleTester} from 'eslint';
import parser from '@babel/eslint-parser';

const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    plugins: [['@babel/plugin-proposal-decorators', {version: '2023-11'}]]
  }
};

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2015
    }
  }
});

ruleTester.run('no-private-properties', rule, {
  valid: [
    'html`<x-foo .bar=${true} ?foo=${true} @baz=${fn}></x-foo>`',
    'html`<x-foo></x-foo>`',
    'html`<x-foo bar baz></x-foo>`',
    'html`<x-foo bar baz=${true}></x-foo>`',
    'html`<x-foo ._bar=${x} .__baz=${y}></x-foo>`',
    {
      code: 'html`<x-foo _bar=${x} __baz=${y}></x-foo>`',
      options: [
        {
          private: '^__',
          protected: '^_'
        }
      ]
    },
    {
      code: 'html`<x-foo ?_bar=${x} ?__baz=${y}></x-foo>`',
      options: [
        {
          private: '^__',
          protected: '^_'
        }
      ]
    },
    {
      code: 'html`<x-foo @_bar=${x} @__baz=${y}></x-foo>`',
      options: [
        {
          private: '^__',
          protected: '^_'
        }
      ]
    },
    'class Foo {}',
    {
      code: `class Foo {
        static get properties() {
          return {
            __whateverCaseYouWant: {type: String}
          };
        }
      }`,
      options: [
        {
          private: '^__',
          protected: '^_',
          checkPropertyDefinitions: true
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            publicProp: {type: String},
          };
        }
      }`,
      options: [
        {
          checkPropertyDefinitions: true
        }
      ]
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
      options: [
        {
          private: '^__',
          protected: '^_',
          checkPropertyDefinitions: true
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property()
        prop = 'foo';
      }`,
      options: [
        {
          private: '^__',
          protected: '^_',
          checkPropertyDefinitions: true
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
        accessor prop = 'foo';
      }`,
      options: [
        {
          private: '^__',
          protected: '^_',
          checkPropertyDefinitions: true
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
        _prop = 'foo';
      }`,
      options: [
        {
          private: '^__',
          checkPropertyDefinitions: true
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
      options: [
        {
          checkPropertyDefinitions: true
        }
      ],
      languageOptions: {
        parser,
        parserOptions
      }
    }
  ],

  invalid: [
    {
      code: 'html`<x-foo ._bar=${x} .__baz=${y}></x-foo>`',
      options: [
        {
          private: '^__',
          protected: '^_'
        }
      ],
      errors: [
        {
          messageId: 'noPrivate',
          line: 1,
          column: 13
        },
        {
          messageId: 'noPrivate',
          line: 1,
          column: 24
        }
      ]
    },
    {
      code: 'html`<x-foo ._protected_bar=${x} .__private__baz=${y}></x-foo>`',
      options: [
        {
          private: '^__private__',
          protected: '^_protected_'
        }
      ],
      errors: [
        {
          messageId: 'noPrivate',
          line: 1,
          column: 13
        },
        {
          messageId: 'noPrivate',
          line: 1,
          column: 34
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            __prop: {type: String}
          };
        }
      }`,
      options: [
        {
          private: '^__',
          protected: '^_',
          checkPropertyDefinitions: true
        }
      ],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'noPrivateDefinition'
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
      options: [
        {
          protected: '^_',
          checkPropertyDefinitions: true
        }
      ],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'noPrivateDefinition'
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
      options: [
        {
          protected: '^\\$',
          checkPropertyDefinitions: true
        }
      ],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'noPrivateDefinition'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property()
        __foo;
      }`,
      options: [
        {
          private: '^__',
          protected: '^_',
          checkPropertyDefinitions: true
        }
      ],
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 9,
          messageId: 'noPrivateDefinition'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property()
        accessor __foo;
      }`,
      options: [
        {
          private: '^__',
          protected: '^_',
          checkPropertyDefinitions: true
        }
      ],
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 18,
          messageId: 'noPrivateDefinition'
        }
      ]
    }
  ]
});
