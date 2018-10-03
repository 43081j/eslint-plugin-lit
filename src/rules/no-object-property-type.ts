/**
 * @fileoverview Disallows `Object` and `Array` to be used as property types
 * @author James Garbutt <htttps://github.com/43081j>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import {getPropertyMap, getIdentifierName} from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Disallows `Object` and `Array` to be used as property types',
      category: 'Best Practices',
      url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-object-property-type.md'
    },
    messages: {
      objectType: '`Array` and `Object` types will not (de)serialize as ' +
        'expected, a custom serializer should be used for the ' +
        'property: {{ name }}'
    }
  },

  create(context): Rule.RuleListener {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Class entered
     *
     * @param {ESTree.Class} node Node entered
     * @return {void}
     */
    function classEnter(node: ESTree.Class): void {
      if (!node.superClass ||
          node.superClass.type !== 'Identifier' ||
          node.superClass.name !== 'LitElement') {
        return;
      }

      const props = getPropertyMap(node);

      if (props) {
        for (const [name, config] of props) {
          const propType = config.properties.find((p): boolean =>
            getIdentifierName(p.key) === 'type');
          if (propType &&
            propType.value.type === 'Identifier' &&
            (propType.value.name === 'Object' ||
              propType.value.name === 'Array')) {
            context.report({
              node: propType.value,
              messageId: 'objectType',
              data: {
                name: name
              }
            });
          }
        }
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      'ClassExpression': (node: ESTree.Node): void =>
        classEnter(node as ESTree.Class),
      'ClassDeclaration': (node: ESTree.Node): void =>
        classEnter(node as ESTree.Class)
    };
  }
};

export = rule;
