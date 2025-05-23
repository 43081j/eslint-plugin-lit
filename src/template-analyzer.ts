import * as ESTree from 'estree';
import * as parse5 from 'parse5';
import {SourceCode} from 'eslint';
import treeAdapter from 'parse5-htmlparser2-tree-adapter';
import {templateExpressionToHtml, getExpressionPlaceholder} from './util.js';

export interface RawAttribute {
  name: string;
  value?: string;
  quotedValue?: string;
}

const isRootNode = (
  node: treeAdapter.Node
): node is treeAdapter.Document | treeAdapter.DocumentFragment =>
  node.type === 'root';

export interface Visitor {
  enter: (node: treeAdapter.Node, parent: treeAdapter.Node | null) => void;
  exit: (node: treeAdapter.Node, parent: treeAdapter.Node | null) => void;
  enterElement: (
    node: treeAdapter.Element,
    parent: treeAdapter.Node | null
  ) => void;
  enterDocumentFragment: (
    node: treeAdapter.DocumentFragment,
    parent: treeAdapter.Node | null
  ) => void;
  enterCommentNode: (
    node: treeAdapter.CommentNode,
    parent: treeAdapter.Node | null
  ) => void;
  enterTextNode: (
    node: treeAdapter.TextNode,
    parent: treeAdapter.Node | null
  ) => void;
}

export interface ParseError extends parse5.Location {
  code: string;
}

type ParserOptionsWithError = parse5.ParserOptions<typeof treeAdapter> & {
  onParseError?: (err: ParseError) => void;
};

const analyzerCache = new WeakMap<
  ESTree.TaggedTemplateExpression,
  TemplateAnalyzer
>();

/**
 * Analyzes a given template expression for traversing its contained
 * HTML tree.
 */
export class TemplateAnalyzer {
  public errors: ReadonlyArray<ParseError> = [];
  public source: string = '';
  protected _node: ESTree.TaggedTemplateExpression;
  protected _ast: treeAdapter.DocumentFragment;

  /**
   * Create an analyzer instance for a given node
   *
   * @param {ESTree.TaggedTemplateExpression} node Node to use
   * @return {!TemplateAnalyzer}
   */
  public static create(
    node: ESTree.TaggedTemplateExpression
  ): TemplateAnalyzer {
    let cached = analyzerCache.get(node);
    if (!cached) {
      cached = new TemplateAnalyzer(node);
      analyzerCache.set(node, cached);
    }
    return cached;
  }

  /**
   * Constructor
   *
   * @param {ESTree.TaggedTemplateExpression} node Node to analyze
   */
  public constructor(node: ESTree.TaggedTemplateExpression) {
    this._node = node;

    this.source = templateExpressionToHtml(node);

    const opts: ParserOptionsWithError = {
      treeAdapter: treeAdapter,
      sourceCodeLocationInfo: true,
      onParseError: (err): void => {
        (this.errors as ParseError[]).push(err);
      }
    };

    if (/<html/i.test(this.source)) {
      this._ast = parse5.parse(this.source, opts);
    } else {
      this._ast = parse5.parseFragment(this.source, opts);
    }
  }

  /**
   * Returns the ESTree location equivalent of a given attribute
   *
   * @param {treeAdapter.Element} element Element which owns this attribute
   * @param {string} attr Attribute name to retrieve
   * @param {SourceCode} source Source code from ESLint
   * @return {?ESTree.SourceLocation}
   */
  public getLocationForAttribute(
    element: treeAdapter.Element,
    attr: string,
    source: SourceCode
  ): ESTree.SourceLocation | null | undefined {
    if (!element.sourceCodeLocation || !element.sourceCodeLocation.attrs) {
      return null;
    }

    const loc = element.sourceCodeLocation.attrs[attr.toLowerCase()];

    return loc ? this.resolveLocation(loc, source) : null;
  }

  /**
   * Returns the value of the specified attribute.
   * If this is an expression, the expression will be returned. Otherwise,
   * the raw value will be returned.
   * NOTE: if an attribute has multiple expressions in its value, this will
   * return the *first* expression.
   * @param {treeAdapter.Element} element Element which owns this attribute
   * @param {string} attr Attribute name to retrieve
   * @param {SourceCode} source Source code from ESLint
   * @return {?ESTree.Expression|string}
   */
  public getAttributeValue(
    element: treeAdapter.Element,
    attr: string,
    source: SourceCode
  ): ESTree.Expression | string | null {
    const value = element.attribs[attr];

    if (value === undefined) {
      return null;
    }

    const loc = this.getLocationForAttribute(element, attr, source);

    if (!loc) {
      return value;
    }

    // We add the attribute name length so we only pick up expressions
    // inside the value part
    const start = source.getIndexFromLoc(loc.start) + attr.length;
    const end = source.getIndexFromLoc(loc.end);

    const containedExpr = this._node.quasi.expressions.find((expr) => {
      if (!expr.loc) {
        return false;
      }

      const exprStart = source.getIndexFromLoc(expr.loc.start);
      const exprEnd = source.getIndexFromLoc(expr.loc.end);

      return exprStart >= start && exprEnd <= end;
    });

    if (containedExpr !== undefined) {
      return containedExpr;
    }

    return value;
  }

  /**
   * Returns the raw attribute source of a given attribute
   *
   * @param {treeAdapter.Element} element Element which owns this attribute
   * @param {string} attr Attribute name to retrieve
   * @return {string}
   */
  public getRawAttributeValue(
    element: treeAdapter.Element,
    attr: string
  ): RawAttribute | null {
    if (!element.sourceCodeLocation) {
      return null;
    }

    const xAttribs = element['x-attribsPrefix'];
    let originalAttr = attr.toLowerCase();

    if (xAttribs && xAttribs[attr]) {
      originalAttr = `${xAttribs[attr]}:${attr}`;
    }

    const loc = element.sourceCodeLocation.attrs[originalAttr];
    const source = this.source.substring(loc.startOffset, loc.endOffset);
    const firstEq = source.indexOf('=');
    const left = firstEq === -1 ? source : source.substr(0, firstEq);
    const right = firstEq === -1 ? undefined : source.substr(firstEq + 1);
    let unquotedValue = right;

    if (right) {
      if (right.startsWith('"') && right.endsWith('"')) {
        unquotedValue = right.replace(/(^"|"$)/g, '');
      } else if (right.startsWith("'") && right.endsWith("'")) {
        unquotedValue = right.replace(/(^'|'$)/g, '');
      }
    }

    return {
      name: left,
      value: unquotedValue,
      quotedValue: right
    };
  }

  /**
   * Resolves a Parse5 location into an ESTree range
   *
   * @param {parse5.Location} loc Location to convert
   * @param {SourceCode} source ESLint source code object
   * @return {ESTree.SourceLocation}
   */
  public resolveLocation(
    loc: parse5.Location,
    source: SourceCode
  ): ESTree.SourceLocation | null {
    if (!this._node.loc || !this._node.quasi.loc) {
      return null;
    }

    let currentOffset = 0;
    // Initial correction is the offset of the overall template literal
    let endCorrection = (this._node.quasi.range?.[0] ?? 0) + 1;
    let startCorrection = endCorrection;
    let startCorrected = false;

    for (let i = 0; i < this._node.quasi.quasis.length; i++) {
      const quasi = this._node.quasi.quasis[i];
      const expr = this._node.quasi.expressions[i];
      const nextQuasi = this._node.quasi.quasis[i + 1];

      currentOffset += quasi.value.raw.length;

      // If we haven't already found the quasi containing the start offset
      // and this quasi ends after it, set the start offset's correction
      // value and leave it from now on.
      if (!startCorrected && loc.startOffset < currentOffset) {
        startCorrection = endCorrection;
        startCorrected = true;
      }

      // If the location ends before this point, it must fit entirely in
      // this quasi and the quasis before it, so we don't care about the rest
      if (loc.endOffset < currentOffset) {
        break;
      }

      // If there's no range, something's really messed up so just fall back
      // to the template literal's location
      if (!quasi.range) {
        return this._node.quasi.loc ?? null;
      }

      if (expr) {
        const placeholder = getExpressionPlaceholder(this._node, quasi);
        const oldOffset = currentOffset;

        // If there's an expression, increment the offset by its placeholder's
        // length (e.g. ${v} may actually be {{__Q:0__}} in HTML)
        currentOffset += placeholder.length;

        // If the offset fits inside the placeholder range, there's nothing
        // smart we can do, so return the expression's location
        if (
          (loc.startOffset >= oldOffset && loc.startOffset < currentOffset) ||
          (loc.endOffset >= oldOffset && loc.endOffset < currentOffset)
        ) {
          return expr.loc ?? null;
        }

        // If the expression has no range, it won't be the only problem
        // so lets just fall back to the template literal's location
        if (!expr.range) {
          return this._node.quasi.loc ?? null;
        }

        // Increment the correction value by the size of the expression.
        // Given an expression ${foo}, its range only covers "foo", not any
        // whitespace or the brackets.
        // To work around this, we use the end of the previous quasi and the
        // start of the next quasi as our [start, end] rather than the
        // expression's own [start, end].
        const exprEnd = nextQuasi?.range?.[0] ?? expr.range[1];
        const exprStart = quasi.range[1];
        endCorrection -= placeholder.length;
        endCorrection += exprEnd - exprStart + 3;
      }
    }

    // If the start never got corrected, parse5 is trying to give us a bad day
    // and probably gave us an offset after the end of the string (it does
    // this). So we should fall back to whatever the current end correction is
    if (!startCorrected) {
      startCorrection = endCorrection;
    }

    try {
      const start = source.getLocFromIndex(loc.startOffset + startCorrection);
      const end = source.getLocFromIndex(loc.endOffset + endCorrection);

      return {
        start,
        end
      };
    } catch (_err) {
      return this._node.quasi.loc ?? null;
    }
  }

  /**
   * Traverse the inner HTML tree with a given visitor
   *
   * @param {Visitor} visitor Visitor to apply
   * @return {void}
   */
  public traverse(visitor: Partial<Visitor>): void {
    const visit = (
      node: treeAdapter.Node,
      parent: treeAdapter.Node | null
    ): void => {
      if (!node) {
        return;
      }

      if (visitor.enter) {
        visitor.enter(node, parent);
      }

      if (isRootNode(node)) {
        if (visitor.enterDocumentFragment) {
          visitor.enterDocumentFragment(node, parent);
        }
      } else if (treeAdapter.isCommentNode(node)) {
        if (visitor.enterCommentNode) {
          visitor.enterCommentNode(node, parent);
        }
      } else if (treeAdapter.isTextNode(node)) {
        if (visitor.enterTextNode) {
          visitor.enterTextNode(node, parent);
        }
      } else if (treeAdapter.isElementNode(node)) {
        if (visitor.enterElement) {
          visitor.enterElement(node, parent);
        }
      }

      if (treeAdapter.isElementNode(node) || isRootNode(node)) {
        const children = node.childNodes;

        if (children && children.length > 0) {
          children.forEach((child): void => {
            visit(child, node);
          });
        }
      }

      if (visitor.exit) {
        visitor.exit(node, parent);
      }
    };

    visit(this._ast, null);
  }
}
