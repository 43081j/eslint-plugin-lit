/**
 * @fileoverview Requires @localized() annotation on classes using msg() from @lit/localize
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {rule} from '../../rules/require-localized-annotation.js';
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

ruleTester.run('require-localized-annotation', rule, {
  valid: [
    {
      // Class with @localized() and msg()
      code: `import {msg, localized} from '@lit/localize';
      @localized()
      class MyElement {
        render() {
          return msg('Hello');
        }
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    },
    {
      // Class without msg() call - no decorator needed
      code: `import {msg} from '@lit/localize';
      class MyElement {
        render() {
          return 'Hello';
        }
      }`
    },
    {
      // msg not imported from @lit/localize
      code: `import {msg} from 'something-else';
      class MyElement {
        render() {
          return msg('Hello');
        }
      }`
    },
    {
      // No import at all
      code: `class MyElement {
        render() {
          return msg('Hello');
        }
      }`
    },
    {
      // msg used outside class
      code: `import {msg} from '@lit/localize';
      msg('Hello');`
    },
    {
      // Aliased localized import
      code: `import {msg, localized as loc} from '@lit/localize';
      @loc()
      class MyElement {
        render() {
          return msg('Hello');
        }
      }`,
      languageOptions: {
        parser,
        parserOptions
      }
    }
  ],

  invalid: [
    {
      // Class with msg() but no @localized() - error on class definition
      code: `import {msg} from '@lit/localize';
      class MyElement {
        render() {
          return msg('Hello');
        }
      }`,
      output: `import {msg, localized} from '@lit/localize';
      @localized()
      class MyElement {
        render() {
          return msg('Hello');
        }
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          messageId: 'missingLocalized',
          line: 2,
          column: 13
        }
      ]
    },
    {
      // Class with msg() in nested call but no @localized() - error on class definition
      code: `import {msg} from '@lit/localize';
      @foo()
      class MyElement {
        render() {
          const x = msg('Hello');
          const y = msg('Hello');
          return x + y;
        }
      }`,
      output: `import {msg, localized} from '@lit/localize';
      @localized()
      @foo()
      class MyElement {
        render() {
          const x = msg('Hello');
          const y = msg('Hello');
          return x + y;
        }
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          messageId: 'missingLocalized',
          line: 3,
          column: 13
        }
      ]
    },
    {
      // Aliased msg import, no decorator
      code: `import {msg as message} from '@lit/localize';
      class MyElement {
        render() {
          return message('Hello');
        }
      }`,
      output: `import {msg as message, localized} from '@lit/localize';
      @localized()
      class MyElement {
        render() {
          return message('Hello');
        }
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          messageId: 'missingLocalized',
          line: 2,
          column: 13
        }
      ]
    },
    {
      // localized imported but not used as decorator
      code: `import {msg, localized} from '@lit/localize';
      export default class MyElement {
        render() {
          return msg('Hello');
        }
      }`,
      output: `import {msg, localized} from '@lit/localize';
      @localized()
      export default class MyElement {
        render() {
          return msg('Hello');
        }
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          messageId: 'missingLocalized',
          line: 2,
          column: 28
        }
      ]
    },
    {
      // Class expression
      code: `import {msg} from '@lit/localize';
      const MyElement = class {
        render() {
          return msg('Hello');
        }
      }`,
      output: `import {msg, localized} from '@lit/localize';
      const MyElement = @localized() class {
        render() {
          return msg('Hello');
        }
      }`,
      languageOptions: {
        parser,
        parserOptions
      },
      errors: [
        {
          messageId: 'missingLocalized',
          line: 2,
          column: 25
        }
      ]
    }
  ]
});
