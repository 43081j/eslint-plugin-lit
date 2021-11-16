/**
 * @fileoverview Disallow different name between
 * the name of the lit element and the filename
 * @author Julien Rousseau <https://github.com/RoXuS>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/file-name-matches-element-name');
import {RuleTester} from 'eslint';

const parser = require.resolve('@babel/eslint-parser');
const parserOptions = {
  sourceType: 'module',
  ecmaVersion: 12,
  requireConfigFile: false,
  babelOptions: {
    plugins: [
      ['@babel/plugin-proposal-decorators', {decoratorsBeforeExport: true}]
    ]
  }
};

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions,
  parser
});

const code = (elementName = 'foo-bar-element'): string => `

@customElement('${elementName}')
class FooBarElement extends LitElement {}`;

const codeWithCustomElement = (elementName = 'foo-bar-element'): string => `
class FooBarElement extends LitElement {}
customElements.define('${elementName}');
`;

ruleTester.run('file-name-matches-element-class', rule, {
  valid: [
    {code: 'class SomeMap extends Map {}', filename: 'not-an-element.js'},
    {code: 'class FooBarElement {}', filename: 'not-related.js'},
    {code: code('foo-bar-element'), filename: '<text>'},
    {code: code('foo-bar-element'), filename: '<input>'},
    {code: code('foo-bar-element'), filename: 'foo-bar-element.js'},
    {code: code('foo-bar-element'), filename: 'foo-bar-element.js'},
    {code: code('foo-bar-element'), filename: 'foo-bar-element.ts'},
    {code: code('foo-bar-element'), filename: 'foo-bar-element.jsx'},
    {
      code: codeWithCustomElement('foo-bar-element'),
      filename: 'FooBarElement.js',
      options: [{transform: 'none'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'FooBarElement.js',
      options: [{transform: 'none'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'FooBarElement.ts',
      options: [{transform: 'none'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'FooBarElement.jsx',
      options: [{transform: 'none'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foo_bar_element.js',
      options: [{transform: 'snake'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foo_bar_element.ts',
      options: [{transform: 'snake'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foo_bar_element.jsx',
      options: [{transform: 'snake'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foo-bar-element.js',
      options: [{transform: 'kebab'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foo-bar-element.ts',
      options: [{transform: 'kebab'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foo-bar-element.jsx',
      options: [{transform: 'kebab'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'fooBarElement.js',
      options: [{transform: 'pascal'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foo_bar_element.js',
      options: [{transform: 'snake'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'fooBarElement.ts',
      options: [{transform: 'pascal'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'fooBarElement.jsx',
      options: [{transform: 'pascal'}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'fooBarElement.js',
      options: [{transform: ['snake', 'kebab', 'pascal']}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'fooBarElement.ts',
      options: [{transform: ['snake', 'kebab', 'pascal']}]
    },
    {
      code: code('foo-bar-element'),
      filename: 'fooBarElement.jsx',
      options: [{transform: ['snake', 'kebab', 'pascal']}]
    },
    {
      code: codeWithCustomElement('foo-bar-element'),
      filename: 'fooBarElement.ts',
      options: [{transform: ['snake', 'kebab', 'pascal']}]
    }
  ],
  invalid: [
    {
      code: code('foo-bar-element'),
      filename: 'FooBarElement.js',
      errors: [
        {
          message: `File name should be one of ["foo-bar-element.js"] but was "FooBarElement"`,
          type: 'CallExpression'
        }
      ]
    },
    {
      code: code('foo-bar-element'),
      filename: 'barfooelement.ts',
      errors: [
        {
          message: `File name should be one of ["foo-bar-element.ts"] but was "barfooelement"`,
          type: 'CallExpression'
        }
      ]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foobarelement.ts',
      errors: [
        {
          message: `File name should be one of ["foo-bar-element.ts"] but was "foobarelement"`,
          type: 'CallExpression'
        }
      ]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foobarelement.ts',
      options: [{transform: ['snake']}],
      errors: [
        {
          message: `File name should be one of ["foo_bar_element.ts"] but was "foobarelement"`,
          type: 'CallExpression'
        }
      ]
    },
    {
      code: code('foo-bar-element'),
      filename: 'foo-bar_element.ts',
      options: [{transform: ['kebab']}],
      errors: [
        {
          message: `File name should be one of ["foo-bar-element.ts"] but was "foo-bar_element"`,
          type: 'CallExpression'
        }
      ]
    },
    {
      code: code('foo_bar_element'),
      filename: 'foo-bar_element.ts',
      options: [{transform: ['kebab']}],
      errors: [
        {
          message: `File name should be one of ["foo_bar_element.ts"] but was "foo-bar_element"`,
          type: 'CallExpression'
        }
      ]
    },
    {
      code: codeWithCustomElement('foo_bar_element'),
      filename: 'foo-bar_element.ts',
      options: [{transform: ['kebab']}],
      errors: [
        {
          message: `File name should be one of ["foo_bar_element.ts"] but was "foo-bar_element"`,
          type: 'CallExpression'
        }
      ]
    }
  ]
});
