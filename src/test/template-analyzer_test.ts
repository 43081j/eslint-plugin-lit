import * as assert from 'assert';
import treeAdapter = require('parse5-htmlparser2-tree-adapter');
import {TemplateAnalyzer} from '../template-analyzer';
import {parse} from 'babel-eslint';
import {TaggedTemplateExpression} from 'estree';

/**
 * Helper for getting the TaggedTemplateExpression from a string of code
 * @param {string} code - code to parse
 * @return {TaggedTemplateExpression|null}
 */
function getTaggedTemplateExpression(
  code: string
): TaggedTemplateExpression | null {
  const ast = parse(code);
  const statement = ast.body[0];
  if (
    statement.type !== 'ExpressionStatement' ||
    statement.expression.type !== 'TaggedTemplateExpression'
  ) {
    return null;
  }
  return statement.expression;
}

describe('TemplateAnalyzer', () => {
  describe('create', () => {
    it('should reuse the analyzer for a given TaggedTemplateExpression', () => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<h1>Hello</h1>`'
      )!;
      const analyzer1 = TemplateAnalyzer.create(taggedTemplate);
      const analyzer2 = TemplateAnalyzer.create(taggedTemplate);
      assert.strictEqual(analyzer1, analyzer2);
    });
    it('should handle parse errors', () => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<h1>Hello<///h1>>>>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      assert.deepEqual(analyzer.errors, [
        {
          code: 'invalid-first-character-of-tag-name',
          endCol: 12,
          endLine: 1,
          endOffset: 11,
          startCol: 12,
          startLine: 1,
          startOffset: 11
        }
      ]);
    });
  });
  describe('getLocationFor', () => {
    /* eslint-disable-next-line max-len */
    it('should return the location of the starting tag of an element', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<h1>Hello</h1>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterElement(node) {
          assert.deepEqual(analyzer.getLocationFor(node), {
            start: {
              line: 1,
              column: 4
            },
            end: {
              line: 1,
              column: 20
            }
          });
          actual += 1;
        }
      });
      assert.strictEqual(actual, 1, 'Incorrect Number of Assertions');
      done();
    });
    it('should return the location of the comment or text node', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<!-- Some comment --><span>Foobar</span>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterCommentNode(node) {
          assert.deepEqual(analyzer.getLocationFor(node), {
            start: {
              line: 1,
              column: 4
            },
            end: {
              line: 1,
              column: 46
            }
          });
          actual += 1;
        },
        enterTextNode(node) {
          assert.deepEqual(analyzer.getLocationFor(node), {
            start: {
              line: 1,
              column: 4
            },
            end: {
              line: 1,
              column: 46
            }
          });
          actual += 1;
        }
      });
      assert.strictEqual(actual, 2, 'Incorrect Number of Assertions');
      done();
    });
    it('should return the loc of any other node type', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<template>Hello</template>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterDocumentFragment(node) {
          assert.deepEqual(analyzer.getLocationFor(node), {
            start: {
              line: 1,
              column: 0
            },
            end: {
              line: 1,
              column: 32
            }
          });
          actual += 1;
        }
      });
      assert.strictEqual(actual, 2, 'Incorrect Number of Assertions');
      done();
    });
  });
  describe('getLocationForAttribute', () => {
    it('should return the attribute location', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<div class="h1">Hello</div>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterElement(node) {
          assert.deepEqual(analyzer.getLocationForAttribute(node, 'class'), {
            start: {
              line: 1,
              column: 4
            },
            end: {
              line: 1,
              column: 33
            }
          });
          actual += 1;
        }
      });
      assert.strictEqual(actual, 1, 'Incorrect Number of Assertions');
      done();
    });
    it('should return the attribute location for svg attributes', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<svg viewBox="0 0 48 48" xlink:href="abc"></svg>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterElement(node) {
          assert.deepEqual(analyzer.getLocationForAttribute(node, 'viewBox'), {
            start: {
              line: 1,
              column: 4
            },
            end: {
              line: 1,
              column: 54
            }
          });
          assert.deepEqual(
            analyzer.getLocationForAttribute(node, 'xlink:href'),
            {
              start: {
                line: 1,
                column: 4
              },
              end: {
                line: 1,
                column: 54
              }
            }
          );
          actual += 2;
        }
      });
      assert.strictEqual(actual, 2, 'Incorrect Number of Assertions');
      done();
    });
    it("should return null if the attribute doesn't exist", (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<div class="h1">Hello</div>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterElement(node) {
          assert.strictEqual(
            analyzer.getLocationForAttribute(node, 'style'),
            null
          );
          actual += 1;
        }
      });
      assert.strictEqual(actual, 1, 'Incorrect Number of Assertions');
      done();
    });
  });
  describe('getRawAttributeValue', () => {
    it('should return the attribute value', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        `html\`
          <div
            class="h1"
            style=\'display: block;\'
            autocapatialize=off>
            Hello
          </div>
        \``
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterElement(node) {
          assert.strictEqual(
            analyzer.getRawAttributeValue(node, 'class'),
            'h1'
          );
          assert.strictEqual(
            analyzer.getRawAttributeValue(node, 'style'),
            'display: block;'
          );
          assert.strictEqual(
            analyzer.getRawAttributeValue(node, 'autocapatialize'),
            'off'
          );
          actual += 3;
        }
      });
      assert.strictEqual(actual, 3, 'Incorrect Number of Assertions');
      done();
    });
    it('should return the attribute value for boolean attributes', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<input disabled>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterElement(node) {
          assert.strictEqual(
            analyzer.getRawAttributeValue(node, 'disabled'),
            ''
          );
          actual += 1;
        }
      });
      assert.strictEqual(actual, 1, 'Incorrect Number of Assertions');
      done();
    });
    it('should return null for unknown attribute values', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<div class="h1">Hello</div>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterElement(node) {
          assert.strictEqual(
            analyzer.getRawAttributeValue(node, 'style'),
            null
          );
          actual += 1;
        }
      });
      assert.strictEqual(actual, 1, 'Incorrect Number of Assertions');
      done();
    });

    it('should return the attribute value for svg attributes', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<svg viewBox="0 0 48 48" xlink:href="abc"></svg>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterElement(node) {
          assert.strictEqual(
            analyzer.getRawAttributeValue(node, 'viewBox'),
            '0 0 48 48'
          );
          assert.strictEqual(
            analyzer.getRawAttributeValue(node, 'xlink:href'),
            'abc'
          );
          assert.strictEqual(
            analyzer.getRawAttributeValue(node, 'href'),
            'abc'
          );
          actual += 3;
        }
      });
      assert.strictEqual(actual, 3, 'Incorrect Number of Assertions');
      done();
    });
  });
  describe('resolveLocation', () => {
    it('should return the location', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<div class="h1">Hello</div>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enterElement(node) {
          const loc = (node as treeAdapter.Element).sourceCodeLocation;
          assert.deepEqual(analyzer.resolveLocation(loc!.startTag), {
            start: {
              line: 1,
              column: 4
            },
            end: {
              line: 1,
              column: 33
            }
          });
          actual += 1;
        }
      });
      assert.strictEqual(actual, 1, 'Incorrect Number of Assertions');
      done();
    });
  });
  describe('traverse', () => {
    it('should not error when no visitors are passed', () => {
      const taggedTemplate = getTaggedTemplateExpression(
        `html\`
          <!-- foo -->
          <span class="bar">baz</span>
          <div><span>nested</span></div>
        \``
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);

      assert.doesNotThrow(() => analyzer.traverse({}));
    });
    it('should call enter, documentFragment and exit', (done) => {
      const taggedTemplate = getTaggedTemplateExpression('html``')!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enter(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterCommentNode() {
          assert.fail('should not be called');
        },
        enterDocumentFragment(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterElement() {
          assert.fail('should not be called');
        },
        enterTextNode() {
          assert.fail('should not be called');
        },
        exit(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        }
      });
      assert.strictEqual(actual, 3, 'Incorrect Number of Assertions');
      done();
    });
    it('should call enter, documentFragment, commentNode and exit', (done) => {
      const taggedTemplate = getTaggedTemplateExpression('html`<!-- foo -->`')!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enter(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterCommentNode(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterDocumentFragment(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterElement() {
          assert.fail('should not be called');
        },
        enterTextNode() {
          assert.fail('should not be called');
        },
        exit(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        }
      });
      assert.strictEqual(actual, 6, 'Incorrect Number of Assertions');
      done();
    });
    it('should call enter, documentFragment, element and exit', (done) => {
      const taggedTemplate = getTaggedTemplateExpression(
        'html`<span></span>`'
      )!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enter(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterCommentNode() {
          assert.fail('should not be called');
        },
        enterDocumentFragment(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterElement(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterTextNode() {
          assert.fail('should not be called');
        },
        exit(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        }
      });
      assert.strictEqual(actual, 6, 'Incorrect Number of Assertions');
      done();
    });
    it('should call enter, documentFragment, textNode and exit', (done) => {
      const taggedTemplate = getTaggedTemplateExpression('html`test`')!;
      const analyzer = TemplateAnalyzer.create(taggedTemplate);
      let actual = 0;

      analyzer.traverse({
        enter(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterCommentNode() {
          assert.fail('should not be called');
        },
        enterDocumentFragment(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        enterElement() {
          assert.fail('should not be called');
        },
        enterTextNode(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        },
        exit(node) {
          assert.ok(node, 'should be called');
          actual += 1;
        }
      });
      assert.strictEqual(actual, 6, 'Incorrect Number of Assertions');
      done();
    });
  });
});
