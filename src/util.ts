import * as ESTree from 'estree';

/**
 * Determines whether a node is a declaration or not
 * @param {ESTree.Node} node
 * @return {boolean}
 */
export function isDeclaration(node: ESTree.Node): node is ESTree.Declaration {
  return node.type === 'FunctionDeclaration' ||
    node.type === 'VariableDeclaration' ||
    node.type === 'ClassDeclaration';
}

/**
 * Determines whether a node is a statement or not
 * @param {ESTree.Node} node
 * @return {boolean}
 */
export function isStatement(node: ESTree.Node): node is ESTree.Statement {
  return node.type === 'ExpressionStatement' ||
    node.type === 'BlockStatement' ||
    node.type === 'EmptyStatement' ||
    node.type === 'DebuggerStatement' ||
    node.type === 'WithStatement' ||
    node.type === 'ReturnStatement' ||
    node.type === 'LabeledStatement' ||
    node.type === 'BreakStatement' ||
    node.type === 'ContinueStatement' ||
    node.type === 'IfStatement' ||
    node.type === 'SwitchStatement' ||
    node.type === 'ThrowStatement' ||
    node.type === 'TryStatement' ||
    node.type === 'WhileStatement' ||
    node.type === 'DoWhileStatement' ||
    node.type === 'ForStatement' ||
    node.type === 'ForInStatement' ||
    node.type === 'ForOfStatement' ||
    isDeclaration(node);
}

/**
 * Determines whether a node is an expression or not
 * @param {ESTree.Node} node
 * @return {boolean}
 */
export function isExpression(node: ESTree.Node): node is ESTree.Expression {
  return node.type === 'ThisExpression' ||
    node.type === 'ArrayExpression' ||
    node.type === 'ObjectExpression' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'YieldExpression' ||
    node.type === 'Literal' ||
    node.type === 'UnaryExpression' ||
    node.type === 'UpdateExpression' ||
    node.type === 'BinaryExpression' ||
    node.type === 'AssignmentExpression' ||
    node.type === 'LogicalExpression' ||
    node.type === 'MemberExpression' ||
    node.type === 'ConditionalExpression' ||
    node.type === 'CallExpression' ||
    node.type === 'NewExpression' ||
    node.type === 'SequenceExpression' ||
    node.type === 'TemplateLiteral' ||
    node.type === 'TaggedTemplateExpression' ||
    node.type === 'ClassExpression' ||
    node.type === 'MetaProperty' ||
    node.type === 'Identifier' ||
    node.type === 'AwaitExpression';
}
