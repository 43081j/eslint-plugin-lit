import {TemplateAnalyzer} from '../template-analyzer.js';
import {parse} from 'espree';
import * as ESTree from 'estree';
import {SourceCode} from 'eslint';
import {expect} from 'chai';
import * as parse5 from 'parse5-htmlparser2-tree-adapter';

const parseOptions = {
  ecmaVersion: 6,
  range: true,
  loc: true,
  comments: true
};

interface ParsedTemplate {
  node: ESTree.TaggedTemplateExpression;
  analyzer: TemplateAnalyzer;
  source: SourceCode;
}

/**
 * Parses a template into an AST, analyzer instance and ESLint source code
 * @param {string} code Code to parse
 * @return {*}
 */
function parseTemplate(code: string): ParsedTemplate {
  const ast = parse(code, parseOptions) as ESTree.Program;
  const source = new SourceCode({
    text: code,
    ast: {
      ...ast,
      tokens: [],
      comments: ast.comments ?? [],
      loc: ast.loc!,
      range: ast.range!
    }
  });
  const node = ((ast as ESTree.Program).body[0] as ESTree.ExpressionStatement)
    .expression as ESTree.TaggedTemplateExpression;

  const analyzer = new TemplateAnalyzer(node);

  return {node, analyzer, source};
}

describe('TemplateAnalyzer', () => {
  let result: ParsedTemplate;

  beforeEach(() => {
    result = parseTemplate(`
      html\`<div title="party"></div>\`;
    `);
  });

  describe('getAttributeValue', () => {
    it('should return literals as-is', () => {
      result.analyzer.traverse({
        enterElement(element) {
          expect(element.attribs['title']).to.equal('party');
          expect(
            result.analyzer.getAttributeValue(element, 'title', result.source)
          ).to.equal('party');
        }
      });
    });

    it('should return expressions', () => {
      result = parseTemplate(`
        html\`<div title=$\{808\}></div>\`;
      `);

      result.analyzer.traverse({
        enterElement(element) {
          expect(element.attribs['title']).to.equal('{{__Q:0__}}');
          const expr = result.analyzer.getAttributeValue(
            element,
            'title',
            result.source
          ) as ESTree.Literal;
          expect(expr.type).to.equal('Literal');
          expect(expr.value).to.equal(808);
        }
      });
    });

    it('should return expression if mixed', () => {
      result = parseTemplate(`
        html\`<div title="foo $\{808\}"></div>\`;
      `);
      result.analyzer.traverse({
        enterElement(element) {
          expect(element.attribs['title']).to.equal('foo {{__Q:0__}}');
          const expr = result.analyzer.getAttributeValue(
            element,
            'title',
            result.source
          ) as ESTree.Literal;
          expect(expr.type).to.equal('Literal');
          expect(expr.value).to.equal(808);
        }
      });
    });

    it('should return first expression if multiple', () => {
      result = parseTemplate(`
        html\`<div title="$\{303\} $\{808\}"></div>\`;
      `);
      result.analyzer.traverse({
        enterElement(element) {
          expect(element.attribs['title']).to.equal('{{__Q:0__}} {{__Q:1__}}');
          const expr = result.analyzer.getAttributeValue(
            element,
            'title',
            result.source
          ) as ESTree.Literal;
          expect(expr.type).to.equal('Literal');
          expect(expr.value).to.equal(303);
        }
      });
    });

    it('should handle non-existent attributes', () => {
      result = parseTemplate(`
        html\`<div></div>\`;
      `);

      result.analyzer.traverse({
        enterElement(element) {
          const expr = result.analyzer.getAttributeValue(
            element,
            'idontexist',
            result.source
          );
          expect(expr).to.equal(null);
        }
      });
    });

    it('should return falsy expressions', () => {
      result = parseTemplate(`
        html\`<div title=$\{null\}></div>\`;
      `);
      result.analyzer.traverse({
        enterElement(element) {
          const expr = result.analyzer.getAttributeValue(
            element,
            'title',
            result.source
          ) as ESTree.Literal;
          expect(expr.type).to.equal('Literal');
          expect(expr.value).to.equal(null);
        }
      });
    });
  });

  describe('traverse', () => {
    beforeEach(() => {
      result = parseTemplate(`
        html\`
          <div title="jeden"></div>
          <div title="dwa"></div>
          Text
          <!-- Comment -->
        \`;
      `);
    });

    describe('enter', () => {
      it('should be called for every node', () => {
        const nodes: parse5.Node[] = [];

        result.analyzer.traverse({
          enter: (node) => {
            if (parse5.isTextNode(node) && node.data.trim() === '') {
              return;
            }
            nodes.push(node);
          }
        });

        expect(nodes.length).to.equal(5);
        expect(nodes[0].type).to.equal('root');
        expect(nodes[1].type).to.equal('tag');
        expect(nodes[2].type).to.equal('tag');
        expect(nodes[3].type).to.equal('text');
        expect(nodes[4].type).to.equal('comment');
      });
    });

    describe('enterDocumentFragment', () => {
      it('should be called for the root fragment', () => {
        const nodes: parse5.Node[] = [];

        result.analyzer.traverse({
          enterDocumentFragment: (node) => {
            nodes.push(node);
          }
        });

        expect(nodes.length).to.equal(1);
        expect(nodes[0].type).to.equal('root');
      });
    });

    describe('enterCommentNode', () => {
      it('should be called for comment nodes', () => {
        const nodes: parse5.Node[] = [];

        result.analyzer.traverse({
          enterCommentNode: (node) => {
            nodes.push(node);
          }
        });

        expect(nodes.length).to.equal(1);
        expect(nodes[0].type).to.equal('comment');
      });
    });

    describe('enterTextNode', () => {
      it('should be called for text nodes', () => {
        const nodes: parse5.Node[] = [];

        result.analyzer.traverse({
          enterTextNode: (node) => {
            nodes.push(node);
          }
        });

        expect(nodes.length).to.equal(4);
        expect(nodes[0].type).to.equal('text');
        expect(nodes[1].type).to.equal('text');
        expect(nodes[2].type).to.equal('text');
        expect(nodes[3].type).to.equal('text');
      });
    });

    describe('enterElement', () => {
      it('should be called for elements', () => {
        const nodes: parse5.Node[] = [];

        result.analyzer.traverse({
          enterElement: (node) => {
            nodes.push(node);
          }
        });

        expect(nodes.length).to.equal(2);
        expect(nodes[0].type).to.equal('tag');
        expect(nodes[1].type).to.equal('tag');
      });
    });

    describe('exit', () => {
      it('should be called for every node', () => {
        const nodes: parse5.Node[] = [];

        result.analyzer.traverse({
          exit: (node) => {
            nodes.push(node);
          }
        });

        expect(nodes.length).to.equal(8);
        expect(nodes[0].type).to.equal('text');
        expect(nodes[1].type).to.equal('tag');
        expect(nodes[2].type).to.equal('text');
        expect(nodes[3].type).to.equal('tag');
        expect(nodes[4].type).to.equal('text');
        expect(nodes[5].type).to.equal('comment');
        expect(nodes[6].type).to.equal('text');
        expect(nodes[7].type).to.equal('root');
      });
    });

    it('should visit children', () => {
      result = parseTemplate(`
        html\`
          <div title="jeden">
            <div title="dwa"></div>
          </div>
        \`;
      `);

      const nodes: parse5.Node[] = [];

      result.analyzer.traverse({
        enter: (node) => {
          nodes.push(node);
        }
      });

      expect(nodes.length).to.equal(7);
      expect(nodes[0].type).to.equal('root');
      expect(nodes[1].type).to.equal('text');
      expect(nodes[2].type).to.equal('tag');
      expect((nodes[2] as parse5.Element).attribs['title']).to.equal('jeden');
      expect(nodes[3].type).to.equal('text');
      expect(nodes[4].type).to.equal('tag');
      expect((nodes[4] as parse5.Element).attribs['title']).to.equal('dwa');
      expect(nodes[5].type).to.equal('text');
      expect(nodes[6].type).to.equal('text');
    });
  });

  it('should handle HTML documents', () => {
    result = parseTemplate(`
      html\`<html><body>Foo</body></html>\`;
    `);

    const nodes: parse5.Node[] = [];

    result.analyzer.traverse({
      enter: (node) => {
        nodes.push(node);
      }
    });

    const body = nodes[3] as parse5.Element;

    expect(nodes.length).to.equal(5);
    expect(nodes[0].type).to.equal('root');
    expect(nodes[1].type).to.equal('tag');
    expect((nodes[1] as parse5.Element).name).to.equal('html');
    expect(nodes[2].type).to.equal('tag');
    expect((nodes[2] as parse5.Element).name).to.equal('head');
    expect(nodes[3].type).to.equal('tag');
    expect((nodes[3] as parse5.Element).name).to.equal('body');
    expect(nodes[4].type).to.equal('text');

    expect(body.sourceCodeLocation).to.deep.equal({
      startLine: 1,
      startCol: 7,
      startOffset: 6,
      endLine: 1,
      endCol: 30,
      endOffset: 29,
      startTag: {
        startLine: 1,
        startCol: 7,
        startOffset: 6,
        endLine: 1,
        endCol: 13,
        endOffset: 12
      },
      endTag: {
        startLine: 1,
        startCol: 16,
        startOffset: 15,
        endLine: 1,
        endCol: 23,
        endOffset: 22
      }
    });
  });

  it('should handle uppercase HTML tags', () => {
    result = parseTemplate(`
      html\`<HTML><body>Foo</body></HTML>\`;
    `);

    const nodes: parse5.Node[] = [];

    result.analyzer.traverse({
      enter: (node) => {
        nodes.push(node);
      }
    });

    expect(nodes.length).to.equal(5);
    expect(nodes[0].type).to.equal('root');
    expect(nodes[1].type).to.equal('tag');
    expect((nodes[1] as parse5.Element).name).to.equal('html');
  });

  it('should have correct position for normalised attributes', () => {
    result = parseTemplate(`
      html\`<div hidden></div>\`;
    `);

    const nodes: parse5.Node[] = [];

    result.analyzer.traverse({
      enter: (node) => {
        nodes.push(node);
      }
    });

    expect(nodes.length).to.equal(2);
    expect(nodes[0].type).to.equal('root');
    expect(nodes[1].type).to.equal('tag');

    const div = nodes[1] as parse5.Element;
    const attrLoc = div.sourceCodeLocation!.attrs['hidden'];

    expect(attrLoc).to.deep.equal({
      startLine: 1,
      startCol: 6,
      startOffset: 5,
      endLine: 1,
      endCol: 12,
      endOffset: 11
    });
  });
});
