import * as util from '../util.js';
import * as ESTree from 'estree';
import {Scope} from 'eslint';
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
        attribute: true,
        attributeName: undefined
      });
    });

    it('should extract property config with non-identifier key', () => {
      const node: ESTree.ObjectExpression = {
        type: 'ObjectExpression',
        properties: []
      };
      const key: ESTree.Literal = {
        type: 'Literal',
        value: 'foo',
        raw: "'foo'"
      };
      const entry = util.extractPropertyEntry(key, node);

      expect(entry).to.deep.equal({
        key,
        expr: node,
        state: false,
        attribute: true,
        attributeName: undefined
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
        attribute: true,
        attributeName: undefined
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
        attribute: false,
        attributeName: undefined
      });
    });

    it('should extract attribute names', () => {
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
              value: 'boop'
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
        attribute: true,
        attributeName: 'boop'
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
        attribute: true,
        attributeName: undefined
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

  describe('findVariableInScope', () => {
    function createVariable(name: string): Scope.Variable {
      return {
        name,
        identifiers: [],
        references: [],
        defs: [],
        scope: null as unknown as Scope.Scope,
        writeable: false
      } as Scope.Variable;
    }

    function createScope(
      variables: Scope.Variable[],
      upper: Scope.Scope | null = null
    ): Scope.Scope {
      const set = new Map<string, Scope.Variable>();
      for (const v of variables) {
        set.set(v.name, v);
      }
      return {
        set,
        upper
      } as Scope.Scope;
    }

    it('should find a variable in the current scope', () => {
      const variable = createVariable('msg');
      const scope = createScope([variable]);

      const result = util.findVariableInScope('msg', scope);
      expect(result).to.equal(variable);
    });

    it('should find a variable in a parent scope', () => {
      const variable = createVariable('msg');
      const parentScope = createScope([variable]);
      const childScope = createScope([], parentScope);

      const result = util.findVariableInScope('msg', childScope);
      expect(result).to.equal(variable);
    });

    it('should find a variable in a grandparent scope', () => {
      const variable = createVariable('msg');
      const grandparentScope = createScope([variable]);
      const parentScope = createScope([], grandparentScope);
      const childScope = createScope([], parentScope);

      const result = util.findVariableInScope('msg', childScope);
      expect(result).to.equal(variable);
    });

    it('should return null when variable is not found', () => {
      const scope = createScope([]);

      const result = util.findVariableInScope('msg', scope);
      expect(result).to.equal(null);
    });

    it('should return null when variable is not found in any scope', () => {
      const parentScope = createScope([createVariable('other')]);
      const childScope = createScope([createVariable('foo')], parentScope);

      const result = util.findVariableInScope('msg', childScope);
      expect(result).to.equal(null);
    });

    it('should return the closest variable when shadowed', () => {
      const parentVariable = createVariable('msg');
      const childVariable = createVariable('msg');
      const parentScope = createScope([parentVariable]);
      const childScope = createScope([childVariable], parentScope);

      const result = util.findVariableInScope('msg', childScope);
      expect(result).to.equal(childVariable);
    });
  });
});
