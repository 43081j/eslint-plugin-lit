import {TemplateAnalyzer} from '../template-analyzer';
import {parse} from 'espree';
import * as ESTree from 'estree';
import {SourceCode} from 'eslint';
import {expect} from 'chai';

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
  });
});
