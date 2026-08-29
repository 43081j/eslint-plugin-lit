/**
 * @fileoverview Enforces accessor keyword on lit decorated class properties
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {rule} from '../../rules/missing-accessor-keyword.js';
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

ruleTester.run('missing-accessor-keyword', rule, {
  valid: [
    'class Foo {}',
    `class Foo {
      static get properties() {
        return {
          whateverCaseYouWant: {type: String}
        };
      }
    }`,
    {
      code: `class Foo extends LitElement {
        @property({ type: String })
        accessor fooProp = 'foo';

        @state()
        accessor fooState;

        @query('#foo')
        accessor fooQuery;

        @queryAll('.foo')
        accessor fooQueryAll;

        @queryAssignedElements({slot: 'list', selector: '.item'})
        accessor fooQueryAssignedElements;

        @queryAssignedNodes({slot: 'header', flatten: true})
        accessor fooQueryAssignedNodes;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: String }) accessor fooProp = 'foo';
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @whatever()
        fooProp;

        @whatever()
        accessor fooProp2;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends NonLitElement {
        @property()
        fooProp;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    }
  ],

  invalid: [
    {
      code: `class Foo extends LitElement {
        @property({ type: String })
        fooProp = 'foo';
      }`,
      output: `class Foo extends LitElement {
        @property({ type: String })
        accessor fooProp = 'foo';
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 16,
          messageId: 'missingAccessorKeyword',
          data: {decoratorName: 'property'}
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @state()
        fooState;

        @query('#foo')
        fooQuery;

        @queryAll('.foo')
        fooQueryAll;

        @queryAssignedElements({slot: 'list', selector: '.item'})
        fooQueryAssignedElements;

        @queryAssignedNodes({slot: 'header', flatten: true})
        fooQueryAssignedNodes;
      }`,
      output: `class Foo extends LitElement {
        @state()
        accessor fooState;

        @query('#foo')
        accessor fooQuery;

        @queryAll('.foo')
        accessor fooQueryAll;

        @queryAssignedElements({slot: 'list', selector: '.item'})
        accessor fooQueryAssignedElements;

        @queryAssignedNodes({slot: 'header', flatten: true})
        accessor fooQueryAssignedNodes;
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 17,
          messageId: 'missingAccessorKeyword',
          data: {decoratorName: 'state'}
        },
        {
          line: 6,
          column: 9,
          endLine: 6,
          endColumn: 17,
          messageId: 'missingAccessorKeyword',
          data: {decoratorName: 'query'}
        },
        {
          line: 9,
          column: 9,
          endLine: 9,
          endColumn: 20,
          messageId: 'missingAccessorKeyword',
          data: {decoratorName: 'queryAll'}
        },
        {
          line: 12,
          column: 9,
          endLine: 12,
          endColumn: 33,
          messageId: 'missingAccessorKeyword',
          data: {decoratorName: 'queryAssignedElements'}
        },
        {
          line: 15,
          column: 9,
          endLine: 15,
          endColumn: 30,
          messageId: 'missingAccessorKeyword',
          data: {decoratorName: 'queryAssignedNodes'}
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: String })
        fooProp = 'foo';

        @whatever()
        fooOther;
      }`,
      output: `class Foo extends LitElement {
        @property({ type: String })
        accessor fooProp = 'foo';

        @whatever()
        fooOther;
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 16,
          messageId: 'missingAccessorKeyword',
          data: {decoratorName: 'property'}
        }
      ]
    },
    {
      code: `class Foo extends SubClass {
        @property({ type: String })
        fooProp = 'foo';
      }`,
      output: `class Foo extends SubClass {
        @property({ type: String })
        accessor fooProp = 'foo';
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 16,
          messageId: 'missingAccessorKeyword',
          data: {decoratorName: 'property'}
        }
      ],
      settings: {
        lit: {
          elementBaseClasses: ['SubClass']
        }
      }
    },
    {
      code: `@customElement('foo-bar')
      class FooBar extends SubClass {
        @property({ type: String })
        fooProp = 'foo';
      }`,
      output: `@customElement('foo-bar')
      class FooBar extends SubClass {
        @property({ type: String })
        accessor fooProp = 'foo';
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 4,
          column: 9,
          endLine: 4,
          endColumn: 16,
          messageId: 'missingAccessorKeyword',
          data: {decoratorName: 'property'}
        }
      ],
      settings: {
        lit: {
          elementBaseClasses: ['SubClass']
        }
      }
    }
  ]
});
