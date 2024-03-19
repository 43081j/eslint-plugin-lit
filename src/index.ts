import type {Rule, ESLint} from 'eslint';
import {configFactory as configAll} from './configs/all';
import {config as configLegacyAll} from './configs/legacy-all';
import {config as configLegacyRecommended} from './configs/legacy-recommended';
import {configFactory as configRecommended} from './configs/recommended';
import requireIndex = require('requireindex');

export const rules = requireIndex(`${__dirname}/rules`) as Record<
  string,
  Rule.RuleModule
>;

const plugin: ESLint.Plugin = {rules};

export const configs = {
  all: configLegacyAll,
  'flat/all': configAll(plugin),
  recommended: configLegacyRecommended,
  'flat/recommended': configRecommended(plugin)
};
