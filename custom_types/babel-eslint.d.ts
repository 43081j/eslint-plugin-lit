declare module 'babel-eslint' {
  export interface Options {
    babelOptions: Record<string, unknown>;
    ecmaVersion: number;
    sourceType: 'module' | 'script';
    allowImportExportEverywhere: boolean;
    requireConfigFile: boolean;
    ecmaFeatures: Partial<{
      globalReturn: boolean;
    }>;
  }
  export function parse(
    code: string,
    options?: Partial<Options>
  ): import('eslint').AST.Program;
}
