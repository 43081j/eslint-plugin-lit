/**
 * @fileoverview Enforces the use of static styles in elements
 * @author James Garbutt <https://github.com/43081j>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/prefer-static-styles');
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

const parser = require.resolve('@babel/eslint-parser');
const parserOptions = {requireConfigFile: false};

ruleTester.run('prefer-static-styles', rule, {
  valid: [
    'html`<div></div>`',
    {
      code: `class Foo extends LitElement {
        static styles = css\`.foo {}\`;
      }`,
      parser,
      parserOptions
    },
    `class Foo extends LitElement {
        static get styles() { return css\`.foo {}\`; };
      }`,
    `class Foo extends LitElement {
        whatever() {
          this.shadowRoot.adoptedStylesheets = [
            new CSSStyleSheet()
          ];
        }
      }`,
    {
      code: 'html`<style>.foo {}</style>`',
      options: ['never']
    },
    {
      code: 'html`<style type="text/css">.foo {}</style>`',
      options: ['never']
    }
  ],

  invalid: [
    {
      code: 'html`<style>.foo {}</style>`',
      errors: [
        {
          messageId: 'always',
          line: 1,
          column: 6
        }
      ]
    },
    {
      code: 'html`<style type="text/css">.foo {}</style>`',
      errors: [
        {
          messageId: 'always',
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 44
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static get styles() { return css\`.foo {}\`; };
      }`,
      options: ['never'],
      errors: [
        {
          messageId: 'never',
          line: 2,
          column: 9,
          endLine: 2,
          endColumn: 53
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        static styles = css\`.foo {}\`;
      }`,
      options: ['never'],
      parser,
      parserOptions,
      errors: [
        {
          messageId: 'never',
          line: 2,
          column: 9,
          endLine: 2,
          endColumn: 38
        }
      ]
    },
    {
      code: `class Foo extends LitElement {
        whatever() {
          this.shadowRoot.adoptedStylesheets = [
            new CSSStyleSheet()
          ];
        }
      }`,
      options: ['never'],
      errors: [
        {
          messageId: 'never',
          line: 3,
          column: 11,
          endLine: 5,
          endColumn: 12
        }
      ]
    }
  ]
});
