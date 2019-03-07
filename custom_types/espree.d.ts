declare module 'espree' {
  export function parse(
    code: string,
    options?: Record<string, unknown>
  ): import('eslint').AST.Program;
}
