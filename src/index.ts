/* eslint-disable max-len */
import type {Rule, ESLint} from 'eslint';
import {configFactory as configAll} from './configs/all.js';
import {config as configLegacyAll} from './configs/legacy-all.js';
import {config as configLegacyRecommended} from './configs/legacy-recommended.js';
import {configFactory as configRecommended} from './configs/recommended.js';
import {rule as ruleAttributeNames} from './rules/attribute-names.js';
import {rule as ruleAttributeValueEntities} from './rules/attribute-value-entities.js';
import {rule as ruleBanAttributes} from './rules/ban-attributes.js';
import {rule as ruleBindingPositions} from './rules/binding-positions.js';
import {rule as ruleLifecycleSuper} from './rules/lifecycle-super.js';
import {rule as ruleNoClassfieldShadowing} from './rules/no-classfield-shadowing.js';
import {rule as ruleNoDuplicateTemplateBindings} from './rules/no-duplicate-template-bindings.js';
import {rule as ruleNoInvalidEscapeSequences} from './rules/no-invalid-escape-sequences.js';
import {rule as ruleNoInvalidHtml} from './rules/no-invalid-html.js';
import {rule as ruleNoLegacyImports} from './rules/no-legacy-imports.js';
import {rule as ruleNoLegacyTemplateSyntax} from './rules/no-legacy-template-syntax.js';
import {rule as ruleNoNativeAttributes} from './rules/no-native-attributes.js';
import {rule as ruleNoPrivateProperties} from './rules/no-private-properties.js';
import {rule as ruleNoPropertyChangeUpdate} from './rules/no-property-change-update.js';
import {rule as ruleNoTemplateArrow} from './rules/no-template-arrow.js';
import {rule as ruleNoTemplateBind} from './rules/no-template-bind.js';
import {rule as ruleNoTemplateMap} from './rules/no-template-map.js';
import {rule as ruleNoThisAssign} from './rules/no-this-assign-in-render.js';
import {rule as ruleNoUselessTemplateLiterals} from './rules/no-useless-template-literals.js';
import {rule as ruleNoValueAttribute} from './rules/no-value-attribute.js';
import {rule as rulePreferNothing} from './rules/prefer-nothing.js';
import {rule as rulePreferStaticStyles} from './rules/prefer-static-styles.js';
import {rule as ruleQuotedExpressions} from './rules/quoted-expressions.js';
import {rule as ruleValueAfterConstraints} from './rules/value-after-constraints.js';

export const rules: Record<string, Rule.RuleModule> = {
  'attribute-names': ruleAttributeNames,
  'attribute-value-entities': ruleAttributeValueEntities,
  'ban-attributes': ruleBanAttributes,
  'binding-positions': ruleBindingPositions,
  'lifecycle-super': ruleLifecycleSuper,
  'no-classfield-shadowing': ruleNoClassfieldShadowing,
  'no-duplicate-template-bindings': ruleNoDuplicateTemplateBindings,
  'no-invalid-escape-sequences': ruleNoInvalidEscapeSequences,
  'no-invalid-html': ruleNoInvalidHtml,
  'no-legacy-imports': ruleNoLegacyImports,
  'no-legacy-template-syntax': ruleNoLegacyTemplateSyntax,
  'no-native-attributes': ruleNoNativeAttributes,
  'no-private-properties': ruleNoPrivateProperties,
  'no-property-change-update': ruleNoPropertyChangeUpdate,
  'no-template-arrow': ruleNoTemplateArrow,
  'no-template-bind': ruleNoTemplateBind,
  'no-template-map': ruleNoTemplateMap,
  'no-this-assign-in-render': ruleNoThisAssign,
  'no-useless-template-literals': ruleNoUselessTemplateLiterals,
  'no-value-attribute': ruleNoValueAttribute,
  'prefer-nothing': rulePreferNothing,
  'prefer-static-styles': rulePreferStaticStyles,
  'quoted-expressions': ruleQuotedExpressions,
  'value-after-constraints': ruleValueAfterConstraints
};

const plugin: ESLint.Plugin = {rules};

export const configs = {
  all: configLegacyAll,
  'flat/all': configAll(plugin),
  recommended: configLegacyRecommended,
  'flat/recommended': configRecommended(plugin)
};

plugin.configs = configs;

export default plugin;
