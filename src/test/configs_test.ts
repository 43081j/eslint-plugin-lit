import type {ESLint, Linter} from 'eslint';
import {expect} from 'chai';
import {configs} from '../index';

type ConfigLike = Linter.FlatConfig | ESLint.ConfigData;

const isFlatConfig = (config: ConfigLike): config is Linter.FlatConfig =>
  !Array.isArray(config.plugins);

describe('configs', () => {
  it('should define configs correctly', () => {
    expect(configs['recommended']).to.be.ok;
    expect(configs['all']).to.be.ok;
    expect(configs['flat/recommended']).to.be.ok;
    expect(configs['flat/all']).to.be.ok;

    expect(isFlatConfig(configs['flat/recommended'])).to.equal(true);
    expect(isFlatConfig(configs['flat/all'])).to.equal(true);
    expect(isFlatConfig(configs['recommended'])).to.equal(false);
    expect(isFlatConfig(configs['all'])).to.equal(false);
  });
});
