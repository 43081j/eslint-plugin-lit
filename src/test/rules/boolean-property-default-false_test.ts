/**
 * @fileoverview Enforces boolean properties to have a false default value
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {rule} from '../../rules/boolean-property-default-false.js';
import {RuleTester} from 'eslint';
import parser from '@babel/eslint-parser';

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

ruleTester.run('boolean-property-default-false', rule, {
  valid: [
    'class Foo {}',
    `class Foo {
      static get properties() {
        return {
          whateverCaseYouWant: { type: Boolean }
        };
      }
    }`,
    `class Foo extends LitElement {
      static properties = {
        boolProp: { type: Boolean }
      };
      constructor() {
        super();
        this.boolProp = false;
      }
    }`,
    `class Foo extends LitElement {
      static properties = {
        strProp: { type: String }
      };
      constructor() {
        super();
        this.strProp = 'foo';
      }
    }`,
    `class Foo extends LitElement {
      static properties = {
        boolProp: { type: Boolean, state: true }
      };
      constructor() {
        super();
        this.boolProp = true;
      }
    }`,
    `class Foo extends LitElement {
      static get properties() {
        return {
          boolProp: { type: Boolean }
        };
      }
      constructor() {
        super();
        this.boolProp = false;
      }
    }`,
    {
      code: `class Foo extends LitElement {
        @state()
        __boolState;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends NonLitElement {
        @property({ type: Boolean })
        boolProp = true;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: Boolean })
        boolProp = false;
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: Boolean })
        accessor boolProp = false;
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
        static properties = {
          boolProp: { type: Boolean }
        };
      }`,
      errors: [
        {
          line: 3,
          column: 11,
          messageId: 'attributeDefault'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static properties = {
          boolProp: { type: Boolean }
        };
        constructor() {
          super();
          this.boolProp = true;
        }
      }`,
      errors: [
        {
          line: 7,
          column: 27,
          messageId: 'attributeDefault'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static properties = {
          boolProp: { type: Boolean }
        };
        constructor() {
          super();
          this.foo = 'bar';
        }
      }`,
      errors: [
        {
          line: 3,
          column: 11,
          messageId: 'attributeDefault'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get properties() {
          return {
            boolProp: { type: Boolean }
          };
        }
        constructor() {
          super();
          this.boolProp = true;
        }
      }`,
      errors: [
        {
          line: 9,
          column: 27,
          messageId: 'attributeDefault'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: Boolean })
        boolProp;
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 9,
          messageId: 'attributeDefault'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: Boolean })
        boolProp = true;
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 20,
          messageId: 'attributeDefault'
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        @property({ type: Boolean })
        accessor boolProp;
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          line: 3,
          column: 18,
          messageId: 'attributeDefault'
        }
      ]
    }
  ]
});
