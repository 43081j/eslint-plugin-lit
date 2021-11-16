/**
 * @fileoverview Disallow different name between
 * the class of the lit element and the filename
 * @author Julien Rousseau <https://github.com/RoXuS>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule = require('../../rules/file-name-matches-element-class');
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

const code = 'class FooBarElement extends LitElement {}';
const codeWithExtends =
  'class FooBarElement extends MySuperBehavior(LitElement) {}';

ruleTester.run('file-name-matches-element-class', rule, {
  valid: [
    {code: 'class SomeMap extends Map {}', filename: 'not-an-element.js'},
    {code: 'class FooBarElement {}', filename: 'not-related.js'},
    {code},
    {code, filename: '<text>'},
    {code, filename: '<input>'},
    {code, filename: 'foo-bar-element.js'},
    {code, filename: 'foo-bar-element.ts'},
    {code, filename: 'foo-bar-element.jsx'},
    {code: codeWithExtends, filename: 'foo-bar-element.js'},
    {code, filename: 'FooBarElement.js', options: [{transform: 'none'}]},
    {code, filename: 'FooBarElement.ts', options: [{transform: 'none'}]},
    {code, filename: 'FooBarElement.jsx', options: [{transform: 'none'}]},
    {code, filename: 'foo_bar_element.js', options: [{transform: 'snake'}]},
    {code, filename: 'foo_bar_element.ts', options: [{transform: 'snake'}]},
    {code, filename: 'foo_bar_element.jsx', options: [{transform: 'snake'}]},
    {code, filename: 'foo-bar-element.js', options: [{transform: 'kebab'}]},
    {code, filename: 'foo-bar-element.ts', options: [{transform: 'kebab'}]},
    {code, filename: 'foo-bar-element.jsx', options: [{transform: 'kebab'}]},
    {code, filename: 'fooBarElement.js', options: [{transform: 'pascal'}]},
    {code, filename: 'fooBarElement.ts', options: [{transform: 'pascal'}]},
    {code, filename: 'fooBarElement.jsx', options: [{transform: 'pascal'}]},
    {
      code,
      filename: 'fooBarElement.js',
      options: [{transform: ['snake', 'kebab', 'pascal']}]
    },
    {
      code,
      filename: 'fooBarElement.ts',
      options: [{transform: ['snake', 'kebab', 'pascal']}]
    },
    {
      code,
      filename: 'fooBarElement.jsx',
      options: [{transform: ['snake', 'kebab', 'pascal']}]
    }
  ],
  invalid: [
    {
      code,
      filename: 'FooBarElement.js',
      errors: [
        {
          message: `File name should be one of ["foo-bar-element.js"] but was "FooBarElement"`,
          type: 'ClassDeclaration'
        }
      ]
    },
    {
      code,
      filename: 'barfooelement.ts',
      errors: [
        {
          message: `File name should be one of ["foo-bar-element.ts"] but was "barfooelement"`,
          type: 'ClassDeclaration'
        }
      ]
    },
    {
      code,
      filename: 'foobarelement.ts',
      errors: [
        {
          message: `File name should be one of ["foo-bar-element.ts"] but was "foobarelement"`,
          type: 'ClassDeclaration'
        }
      ]
    },
    {
      code,
      filename: 'foobarelement.ts',
      options: [{transform: ['snake']}],
      errors: [
        {
          message: `File name should be one of ["foo_bar_element.ts"] but was "foobarelement"`,
          type: 'ClassDeclaration'
        }
      ]
    },
    {
      code,
      filename: 'foo-bar_element.ts',
      options: [{transform: ['kebab']}],
      errors: [
        {
          message: `File name should be one of ["foo-bar-element.ts"] but was "foo-bar_element"`,
          type: 'ClassDeclaration'
        }
      ]
    }
  ]
});
