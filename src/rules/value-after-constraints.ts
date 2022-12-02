/**
 * @fileoverview Enforces that `value` is bound on an input after constraints
 * @author James Garbutt <https://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {TemplateAnalyzer} from '../template-analyzer';
import {isExpressionPlaceholder} from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const knownConstraints: string[] = [
  'max',
  'min',
  'maxlength',
  'minlength',
  'pattern'
];

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Enforces that `value` is bound on an input after constraints',
      category: 'Best Practices',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/value-after-constraints.md'
    },
    schema: [],
    messages: {
      valueAfter:
        'The `value` property/attribute should be bound after any bound ' +
        'validation constraints (e.g. `min`, `max`, etc) to ensure they are ' +
        'enabled before the value is set.'
    }
  },

  create(context): Rule.RuleListener {
    const source = context.getSourceCode();

    return {
      TaggedTemplateExpression: (node: ESTree.Node): void => {
        if (
          node.type === 'TaggedTemplateExpression' &&
          node.tag.type === 'Identifier' &&
          node.tag.name === 'html'
        ) {
          const analyzer = TemplateAnalyzer.create(node);

          analyzer.traverse({
            enterElement: (element): void => {
              if (element.tagName !== 'input' || !element.sourceCodeLocation) {
                return;
              }

              const valueName = element.attribs['.value'] ? '.value' : 'value';
              const attrLocs = element.sourceCodeLocation.attrs;
              const valueLoc = attrLocs[valueName];
              const valueAttr = element.attribs[valueName];

              if (
                !valueAttr ||
                !valueLoc ||
                !isExpressionPlaceholder(valueAttr)
              ) {
                return;
              }

              for (const constraint of knownConstraints) {
                const constraintName = element.attribs[`.${constraint}`]
                  ? `.${constraint}`
                  : constraint;
                const constraintLoc = attrLocs[constraintName];
                const constraintAttr = element.attribs[constraintName];

                if (
                  constraintAttr &&
                  constraintLoc &&
                  isExpressionPlaceholder(constraintAttr) &&
                  constraintLoc.startOffset > valueLoc.startOffset
                ) {
                  const loc = analyzer.getLocationForAttribute(
                    element,
                    valueName,
                    source
                  );

                  if (loc) {
                    context.report({
                      loc: loc,
                      messageId: 'valueAfter'
                    });
                  }
                }
              }
            }
          });
        }
      }
    };
  }
};

export = rule;
