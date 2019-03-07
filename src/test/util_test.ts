import * as assert from 'assert';
import {parse} from 'espree';
import * as babelEslint from 'babel-eslint';
import * as utils from '../util';
import {
  VariableDeclaration,
  Literal,
  Identifier,
  ClassDeclaration,
  ObjectExpression,
  ReturnStatement,
  TaggedTemplateExpression,
  ExpressionStatement
} from 'estree';

const ESPREE_CONFIG = {
  ecmaVersion: 6,
  comment: true,
  tokens: true,
  range: true,
  loc: true
};

const BABEL_ESLINT_CONFIG: Partial<babelEslint.Options> = {
  ecmaVersion: 6
};

describe('util', () => {
  describe('getIdentifierName', () => {
    it('should return the raw data when node of type "Literal"', () => {
      const ast = parse(`const foo = 'bar'`, ESPREE_CONFIG);
      const node = (ast.body[0] as VariableDeclaration).declarations[0]
        .init as Literal;
      assert.equal(utils.getIdentifierName(node), "'bar'");
    });
    it('should return the name when node of type "Identifier"', () => {
      const ast = parse(`const foo = 'bar'`, ESPREE_CONFIG);
      const node = (ast.body[0] as VariableDeclaration).declarations[0]
        .id as Identifier;
      assert.equal(utils.getIdentifierName(node), 'foo');
    });
    it('should return undefined in any other case', () => {
      const ast = parse(`class Foo {}`, ESPREE_CONFIG);
      const node = ast.body[0];
      assert.equal(utils.getIdentifierName(node), undefined);
    });
  });
  describe('getPropertyMap', () => {
    it('should return nothing when an empty class is provided', () => {
      const ast = parse(`class Foo {}`, ESPREE_CONFIG);
      const node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
    });
    /* eslint-disable-next-line max-len */
    it('should return nothing when not using the static properites getter', () => {
      const ast = parse(
        `class Foo { static get props() {return {}}}`,
        ESPREE_CONFIG
      );
      const node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
    });
    it('should return nothing when missing a return statement', () => {
      const ast = parse(
        `class Foo { static get properties() {const p = {}}}`,
        ESPREE_CONFIG
      );
      const node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
    });
    it('should return nothing when not returning an object', () => {
      let ast = parse(
        `class Foo { static get properties() {return undefined}}`,
        ESPREE_CONFIG
      );
      let node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
      ast = parse(
        `class Foo { static get properties() {return false}}`,
        ESPREE_CONFIG
      );
      node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
    });
    it('should return nothing when returning an empty object', () => {
      const ast = parse(
        `
        class Foo {
          static get properties() {
            return {}
          }
        }
      `,
        ESPREE_CONFIG
      );
      const node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
    });
    /* eslint-disable-next-line max-len */
    it('should return nothing when returning a malformed property object', () => {
      const ast = parse(
        `
        class Foo {
          static get properties() {
            return {
              foo: String
            }
          }
        }
      `,
        ESPREE_CONFIG
      );
      const node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
    });
    /* eslint-disable-next-line max-len */
    it('should return a map of the properties nodes when providing a property object', () => {
      const ast = parse(
        `
        class Foo {
          static get properties() {
            return {
              foo: { type: String }
            }
          }
        }
      `,
        ESPREE_CONFIG
      );
      const classNode = ast.body[0] as ClassDeclaration;
      const returnStatement = classNode.body.body[0].value.body
        .body[0] as ReturnStatement;
      const objectExpression = returnStatement.argument as ObjectExpression;
      const propertyNode = objectExpression.properties[0].value;
      const resultMap = new Map();
      resultMap.set('foo', propertyNode);
      assert.deepStrictEqual(utils.getPropertyMap(classNode), resultMap);
    });
    it('should return nothing when there are no property decorators', () => {
      const ast = babelEslint.parse(
        `
        class Foo {
          @someDecorator() foobar = 1;
        }
      `,
        BABEL_ESLINT_CONFIG
      );
      const node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
    });
    /* eslint-disable-next-line max-len */
    it('should return nothing when not passing an object to the property decorator', () => {
      let ast = babelEslint.parse(
        `
        class Foo {
          @property() foobar = 1;
        }
      `,
        BABEL_ESLINT_CONFIG
      );
      let node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
      ast = babelEslint.parse(
        `
        class Foo {
          @property('string') foobar = 1;
        }
      `,
        BABEL_ESLINT_CONFIG
      );
      node = ast.body[0] as ClassDeclaration;
      assert.deepStrictEqual(utils.getPropertyMap(node), new Map());
    });
    /* eslint-disable-next-line max-len */
    it('should return a map of the properties nodes when providing a property decorator', () => {
      const ast = babelEslint.parse(
        `
        class Foo {
          @property({ type: String }) foo = 'bar';
        }
      `,
        BABEL_ESLINT_CONFIG
      );
      const classNode = ast.body[0] as ClassDeclaration;
      const decorator =
        // @ts-ignore
        classNode.body.body[0].decorators[0].expression.arguments[0];
      const resultMap = new Map();
      resultMap.set('foo', decorator);
      assert.deepStrictEqual(utils.getPropertyMap(classNode), resultMap);
    });
  });
  describe('getExpressionPlaceholder', () => {
    it('should generaate a placeholder string for a given quasi', () => {
      const ast = parse(
        'const baz=3; html`<x-foo bar=${baz}></x-foo>`',
        ESPREE_CONFIG
      );
      const expression = (ast.body[1] as ExpressionStatement)
        .expression as TaggedTemplateExpression;
      assert.equal(
        utils.getExpressionPlaceholder(expression, expression.quasi.quasis[1]),
        `{{__Q:1__}}`
      );
      assert.equal(
        utils.getExpressionPlaceholder(expression, expression.quasi.quasis[0]),
        `"{{__Q:0__}}"`
      );
    });
  });
  describe('isExpressionPlaceholder', () => {
    it('should return true when the expression is a placeholder', () => {
      assert.equal(utils.isExpressionPlaceholder('{{__Q:1234__}}'), true);
      assert.equal(utils.isExpressionPlaceholder('{{__Q:1as32__}}'), false);
      assert.equal(utils.isExpressionPlaceholder('{{__:1234__}}'), false);
      assert.equal(utils.isExpressionPlaceholder('__Q:1234__'), false);
    });
  });
  describe('templateExpressionToHtml', () => {
    it('should return the HTML of a tagged template expression', () => {
      const ast = parse(
        `
          const baz=3;
          html\`<x-foo bar=\${baz} foobar=\${baz} test val="1"></x-foo>\`
        `,
        ESPREE_CONFIG
      );
      const expression = (ast.body[1] as ExpressionStatement)
        .expression as TaggedTemplateExpression;
      assert.equal(
        utils.templateExpressionToHtml(expression),
        '<x-foo bar="{{__Q:0__}}" foobar="{{__Q:1__}}" test val="1"></x-foo>'
      );
    });
  });
});
