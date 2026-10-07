/**
 * @fileoverview Enforces that the id parameter is defined in @lit/localize msg() calls
 * @author Julien Pradelle <https://github.com/jpradelle>
 */

import {rule, idGenerator} from '../../rules/require-id-localization-msg.js';
import {RuleTester} from 'eslint';

// Mock idGenerator.generate to produce deterministic IDs for autofix tests
const MOCK_ID = 'MOCKED_ID';
idGenerator.generate = () => MOCK_ID;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2015
    }
  }
});

ruleTester.run('require-id-localization-msg', rule, {
  valid: [
    {
      code: `import {msg} from '@lit/localize';
      msg('foo', {id: 'foo'});`
    },
    {
      code: `import {msg as message} from '@lit/localize';
      message('foo', {id: 'foo'});`
    },
    {
      code: `import {msg} from '@lit/localize';
      const someOtherMsg = (a) => a;
      someOtherMsg('foo');`
    },
    {
      code: `import {msg} from 'something-else';
      msg('foo');`
    },
    {
      // Not imported from @lit/localize
      code: `msg('foo');`
    },
    {
      code: `import {msg} from '@lit/localize';
      msg('foo');`,
      options: [{onlyForTemplateLiterals: true}]
    },
    {
      code: `import {msg} from '@lit/localize';
      msg(\`hello\`, {id: 'hello'});`,
      options: [{onlyForTemplateLiterals: true}]
    }
  ],

  invalid: [
    {
      code: `import {msg} from '@lit/localize';
      msg('foo');`,
      errors: [
        {
          line: 2,
          column: 7,
          messageId: 'missingId'
        }
      ]
    },
    {
      code: `import {msg} from '@lit/localize';
      export class Test {
        __testFunc() {
          return msg('foo');
        }
      }`,
      errors: [
        {
          line: 4,
          column: 18,
          messageId: 'missingId'
        }
      ]
    },
    {
      code: `import {msg} from '@lit/localize';
      msg('foo', {notId: 'bar'});`,
      errors: [
        {
          line: 2,
          column: 7,
          messageId: 'missingId'
        }
      ]
    },
    {
      code: `import {msg as message} from '@lit/localize';
      message('foo');`,
      errors: [
        {
          line: 2,
          column: 7,
          messageId: 'missingId'
        }
      ]
    },
    {
      code: `import {msg} from '@lit/localize';
      msg('foo', {});`,
      errors: [
        {
          line: 2,
          column: 7,
          messageId: 'missingId'
        }
      ]
    },
    {
      code: `import {msg, str} from '@lit/localize';
      msg(str\`hello\`);`,
      options: [{onlyForTemplateLiterals: true}],
      errors: [
        {
          line: 2,
          column: 7,
          messageId: 'missingId'
        }
      ]
    },
    {
      code: `import {msg} from '@lit/localize';
      msg('foo');`,
      options: [{autoFixWithRandomId: true}],
      output: `import {msg} from '@lit/localize';
      msg('foo', {id: '${MOCK_ID}'});`,
      errors: [
        {
          line: 2,
          column: 7,
          messageId: 'missingId'
        }
      ]
    },
    {
      code: `import {msg} from '@lit/localize';
      msg('foo', {});`,
      options: [{autoFixWithRandomId: true}],
      output: `import {msg} from '@lit/localize';
      msg('foo', {id: '${MOCK_ID}'});`,
      errors: [
        {
          line: 2,
          column: 7,
          messageId: 'missingId'
        }
      ]
    },
    {
      code: `import {msg} from '@lit/localize';
      msg('foo', {desc: 'bar'});`,
      options: [{autoFixWithRandomId: true}],
      output: `import {msg} from '@lit/localize';
      msg('foo', {desc: 'bar', id: '${MOCK_ID}'});`,
      errors: [
        {
          line: 2,
          column: 7,
          messageId: 'missingId'
        }
      ]
    }
  ]
});
