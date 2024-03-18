import type {Rule, ESLint} from 'eslint';
import all from './configs/all';
import {config as configLegacyRecommended} from './configs/legacy-recommended';
import {configFactory as configRecommended} from './configs/recommended';
import requireIndex = require('requireindex');

export const rules = requireIndex(`${__dirname}/rules`) as Record<
  string,
  Rule.RuleModule
>;

const plugin: ESLint.Plugin = {rules};

export const configs = {
  all,
  recommended: configLegacyRecommended,
  'flat/recommended': configRecommended(plugin)
};
