import all from './configs/all';
import recommended from './configs/recommended';
import requireIndex = require('requireindex');

export const rules = requireIndex(`${__dirname}/rules`);

export const configs = {
  all,
  recommended
};
