import {Linter} from 'eslint';
import {expect} from 'chai';
import {configs} from '../index';

describe('configs', () => {
  it('should load flat configs correctly', () => {
    const linter = new Linter({
      configType: 'flat'
    });

    const result = linter.verify(
      'html`<x-foo bar bar>`',
      [
        {
          files: ['*.js'],
          ...configs['flat/recommended']
        }
      ],
      'foo.js'
    );

    expect(result.length).to.equal(1);
  });

  it('should load legacy configs correctly', () => {
    const linter = new Linter();

    const result = linter.verify(
      'html`<x-foo bar bar>`',
      {
        extends: ['plugin:lit/recommended']
      },
      'foo.js'
    );

    expect(result.length).to.equal(1);
  });
});
