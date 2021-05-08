import * as util from '../util';
import * as ESTree from 'estree';
import {expect} from 'chai';

describe('util', () => {
  describe('getIdentifierName', () => {
    it('should return identifier names', () => {
      expect(
        util.getIdentifierName({
          type: 'Identifier',
          name: 'foo'
        })
      ).to.equal('foo');
    });

    it('should return literal values', () => {
      expect(
        util.getIdentifierName({
          type: 'Literal',
          value: 'foo',
          raw: 'foo'
        })
      ).to.equal('foo');
    });

    it('should return undefined for unknown types', () => {
      expect(
        util.getIdentifierName({
          type: 'ImportSpecifier',
          imported: {
            type: 'Identifier',
            name: 'foobles'
          },
          local: {
            type: 'Identifier',
            name: 'foobles'
          }
        })
      ).to.equal(undefined);
    });
  });

  describe('extractPropertyEntry', () => {
    it('should extract property config', () => {
      const node: ESTree.ObjectExpression = {
        type: 'ObjectExpression',
        properties: []
      };
      const entry = util.extractPropertyEntry(node);

      expect(entry).to.deep.equal({
        expr: node,
        state: false,
        attribute: true
      });
    });

    it('should extract state flag', () => {
      const node: ESTree.ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            kind: 'init',
            method: false,
            shorthand: false,
            computed: false,
            key: {
              type: 'Identifier',
              name: 'state'
            },
            value: {
              type: 'Literal',
              value: true
            }
          }
        ]
      };
      const entry = util.extractPropertyEntry(node);

      expect(entry).to.deep.equal({
        expr: node,
        state: true,
        attribute: true
      });
    });

    it('should extract attribute flag', () => {
      const node: ESTree.ObjectExpression = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            kind: 'init',
            method: false,
            shorthand: false,
            computed: false,
            key: {
              type: 'Identifier',
              name: 'attribute'
            },
            value: {
              type: 'Literal',
              value: false
            }
          }
        ]
      };
      const entry = util.extractPropertyEntry(node);

      expect(entry).to.deep.equal({
        expr: node,
        state: false,
        attribute: false
      });
    });
  });
});
