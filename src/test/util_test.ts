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
      const key: ESTree.Identifier = {
        type: 'Identifier',
        name: 'foo'
      };
      const entry = util.extractPropertyEntry(key, node);

      expect(entry).to.deep.equal({
        key,
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
      const key: ESTree.Identifier = {
        type: 'Identifier',
        name: 'foo'
      };
      const entry = util.extractPropertyEntry(key, node);

      expect(entry).to.deep.equal({
        key,
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
      const key: ESTree.Identifier = {
        type: 'Identifier',
        name: 'foo'
      };
      const entry = util.extractPropertyEntry(key, node);

      expect(entry).to.deep.equal({
        key,
        expr: node,
        state: false,
        attribute: false
      });
    });

    it('should ignore unknown properties', () => {
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
              name: 'nonsense'
            },
            value: {
              type: 'Literal',
              value: 'gibberish'
            }
          }
        ]
      };
      const key: ESTree.Identifier = {
        type: 'Identifier',
        name: 'foo'
      };

      const entry = util.extractPropertyEntry(key, node);

      expect(entry).to.deep.equal({
        key,
        expr: node,
        state: false,
        attribute: true
      });
    });
  });

  describe('getPropertyMap', () => {
    it('should retrieve from static getter', () => {
      const node: ESTree.ClassExpression = {
        type: 'ClassExpression',
        body: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              static: true,
              computed: false,
              kind: 'get',
              key: {
                type: 'Identifier',
                name: 'properties'
              },
              value: {
                type: 'FunctionExpression',
                params: [],
                body: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'ReturnStatement',
                      argument: {
                        type: 'ObjectExpression',
                        properties: [
                          {
                            type: 'Property',
                            kind: 'init',
                            shorthand: false,
                            computed: false,
                            method: false,
                            key: {
                              type: 'Identifier',
                              name: 'someProp'
                            },
                            value: {
                              type: 'ObjectExpression',
                              properties: []
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      };

      const map = util.getPropertyMap(node);

      expect(map.size).to.equal(1);
      expect(map.has('someProp')).to.equal(true);
    });

    it('should ignore unrecognised static getters', () => {
      const node: ESTree.ClassExpression = {
        type: 'ClassExpression',
        body: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              static: true,
              computed: false,
              kind: 'get',
              key: {
                type: 'Identifier',
                name: 'properties'
              },
              value: {
                type: 'FunctionExpression',
                params: [],
                body: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'ReturnStatement',
                      argument: {
                        type: 'Literal',
                        value: 808
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      };

      const map = util.getPropertyMap(node);

      expect(map.size).to.equal(0);
    });

    it('should retrieve from static field', () => {
      const node: ESTree.ClassExpression = {
        type: 'ClassExpression',
        body: {
          type: 'ClassBody',
          body: [
            {
              type: 'PropertyDefinition',
              static: true,
              computed: false,
              key: {
                type: 'Identifier',
                name: 'properties'
              },
              value: {
                type: 'ObjectExpression',
                properties: [
                  {
                    type: 'Property',
                    kind: 'init',
                    shorthand: false,
                    computed: false,
                    method: false,
                    key: {
                      type: 'Identifier',
                      name: 'someProp'
                    },
                    value: {
                      type: 'ObjectExpression',
                      properties: []
                    }
                  }
                ]
              }
            }
          ]
        }
      };

      const map = util.getPropertyMap(node);

      expect(map.size).to.equal(1);
      expect(map.has('someProp')).to.equal(true);
    });

    it('should skip non-standard static fields', () => {
      const node: ESTree.ClassExpression = {
        type: 'ClassExpression',
        body: {
          type: 'ClassBody',
          body: [
            {
              type: 'PropertyDefinition',
              static: true,
              computed: false,
              key: {
                type: 'Identifier',
                name: 'properties'
              },
              value: {
                type: 'ObjectExpression',
                properties: [
                  {
                    type: 'Property',
                    kind: 'init',
                    shorthand: false,
                    computed: false,
                    method: false,
                    key: {
                      type: 'Identifier',
                      name: 'someProp'
                    },
                    value: {
                      type: 'Literal',
                      value: 'foo',
                      raw: 'foo'
                    }
                  }
                ]
              }
            }
          ]
        }
      };

      const map = util.getPropertyMap(node);

      expect(map.size).to.equal(0);
    });
  });
});
