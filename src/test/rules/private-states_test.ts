/**
 * @fileoverview Enforces private or protected visibility of reactive states
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {rule} from '../../rules/private-states.js';
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

ruleTester.run('private-states', rule, {
  valid: [
    'class Foo {}',
    {
      code: `class Foo {
        static get properties() {
          return {
            whateverCaseYouWant: {state: true}
          };
        }
      }`,
      options: stdOptions
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            publicState: {state: true},
          };
        }
      }`
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            _protectedState: {state: true},
            __privateState: {state: true},
            publicProperty: {type: String}
          };
        }
      }`,
      options: stdOptions
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            $protectedState: {state: true},
            $$privateState: {state: true},
            publicProperty: {type: String}
          };
        }
      }`,
      options: [
        {
          private: '^\\$\\$',
          protected: '^\\$'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @state()
        _protectedState = 'foo';
        @state()
        __privateState = 'foo';
      }`,
      options: stdOptions,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @state()
        __privateState = 'foo';
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
    }
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            fooState: {state: true}
          };
        }
      }`,
      options: stdOptions,
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'notPrivateOrProtected'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            fooState: {state: true}
          };
        }
      }`,
      options: [{private: '^__'}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'notPrivate'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            fooState: {state: true}
          };
        }
      }`,
      options: [{protected: '^_'}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'notProtected'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            __fooState: {state: true}
          };
        }
      }`,
      options: [{private: '^#'}],
      errors: [
        {
          line: 4,
          column: 13,
          messageId: 'notPrivate'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @state()
        fooState;
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
          messageId: 'notPrivateOrProtected'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @state()
        accessor fooState;
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
          messageId: 'notPrivateOrProtected'
        }
      ]
    }
  ]
});
