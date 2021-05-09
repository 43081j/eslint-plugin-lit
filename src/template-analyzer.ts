import * as ESTree from 'estree';
import * as parse5 from 'parse5';
import treeAdapter = require('parse5-htmlparser2-tree-adapter');
import {templateExpressionToHtml, getExpressionPlaceholder} from './util';

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

    this._ast = parse5.parseFragment(this.source, opts);
  }

  /**
   * Returns the ESTree location equivalent of a given parsed location.
   *
   * @param {treeAdapter.Node} node Node to retrieve location of
   * @return {?ESTree.SourceLocation}
   */
  public getLocationFor(
    node: treeAdapter.Node
  ): ESTree.SourceLocation | null | undefined {
    if (treeAdapter.isElementNode(node)) {
      const loc = node.sourceCodeLocation;

      if (loc) {
        return this.resolveLocation(loc.startTag);
      }
    } else if (
      treeAdapter.isCommentNode(node) ||
      treeAdapter.isTextNode(node)
    ) {
      const loc = node.sourceCodeLocation;

      if (loc) {
        return this.resolveLocation(loc);
      }
    }

    return this._node.loc;
  }

  /**
   * Returns the ESTree location equivalent of a given attribute
   *
   * @param {treeAdapter.Element} element Element which owns this attribute
   * @param {string} attr Attribute name to retrieve
   * @return {?ESTree.SourceLocation}
   */
  public getLocationForAttribute(
    element: treeAdapter.Element,
    attr: string
  ): ESTree.SourceLocation | null | undefined {
    if (!element.sourceCodeLocation) {
      return null;
    }

    const loc = element.sourceCodeLocation.attrs[attr.toLowerCase()];

    return loc ? this.resolveLocation(loc) : null;
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
   * Resolves a Parse5 location into an ESTree location
   *
   * @param {parse5.Location} loc Location to convert
   * @return {ESTree.SourceLocation}
   */
  public resolveLocation(loc: parse5.Location): ESTree.SourceLocation | null {
    let offset = 0;
    let height = 0;

    if (!this._node.loc || !this._node.quasi.loc) return null;

    for (const quasi of this._node.quasi.quasis) {
      const placeholder = getExpressionPlaceholder(this._node, quasi);
      offset += quasi.value.raw.length + placeholder.length;

      const i = this._node.quasi.quasis.indexOf(quasi);
      if (i !== 0) {
        const expression = this._node.quasi.expressions[i - 1];
        if (!expression.loc) return null;
        height += expression.loc.end.line - expression.loc.start.line;
      }

      if (loc.startOffset < offset) {
        break;
      }
    }

    let startOffset;
    let endOffset;
    if (loc.startLine === 1) {
      startOffset = loc.startCol + this._node.quasi.loc.start.column;
      endOffset = loc.endCol + this._node.quasi.loc.start.column;
    } else {
      startOffset = loc.startCol - 1;
      endOffset = loc.endCol;
    }

    return {
      start: {
        line: loc.startLine - 1 + this._node.loc.start.line + height,
        column: startOffset
      },
      end: {
        line: loc.endLine - 1 + this._node.loc.start.line + height,
        column: endOffset
      }
    };
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
