/**
 * AST import relationship parser using @babel/parser & @babel/traverse
 */
import * as babelParser from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;

/**
 * Parses source code and extracts import/export relationships
 * @param {string} code - Source file content
 * @param {string} filePath - Path of the file for error context & plugin tuning
 * @returns {Object} { imports: Array, parseError: Object|null }
 */
export function parseSourceImports(code, filePath = 'file.js') {
  if (!code || typeof code !== 'string') {
    return { imports: [], parseError: null };
  }

  const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  const isJsx = filePath.endsWith('.jsx') || filePath.endsWith('.tsx');

  const plugins = [
    'asyncGenerators',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'dynamicImport',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'nullishCoalescingOperator',
    'numericSeparator',
    'objectRestSpread',
    'optionalCatchBinding',
    'optionalChaining',
    'topLevelAwait',
  ];

  if (isJsx) {
    plugins.push('jsx');
  }

  if (isTypeScript) {
    plugins.push('typescript');
  }

  let ast;
  try {
    ast = babelParser.parse(code, {
      sourceType: 'unambiguous',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins
    });
  } catch (err) {
    return {
      imports: [],
      parseError: {
        message: err.message,
        line: err.loc ? err.loc.line : null,
        column: err.loc ? err.loc.column : null
      }
    };
  }

  const imports = [];

  try {
    traverse(ast, {
      // 1. ES Import Declarations
      ImportDeclaration({ node }) {
        if (!node.source || !node.source.value) return;
        const sourceValue = node.source.value.trim();

        const specifiers = (node.specifiers || []).map((spec) => {
          if (spec.type === 'ImportDefaultSpecifier') {
            return { type: 'default', local: spec.local?.name };
          }
          if (spec.type === 'ImportNamespaceSpecifier') {
            return { type: 'namespace', local: spec.local?.name };
          }
          if (spec.type === 'ImportSpecifier') {
            return {
              type: 'named',
              imported: spec.imported?.name || spec.imported?.value,
              local: spec.local?.name
            };
          }
          return { type: 'unknown' };
        });

        let importType = 'es_named';
        if (specifiers.length === 0) {
          importType = 'es_side_effect';
        } else if (specifiers.some((s) => s.type === 'namespace')) {
          importType = 'es_namespace';
        } else if (specifiers.every((s) => s.type === 'default')) {
          importType = 'es_default';
        }

        imports.push({
          source: sourceValue,
          type: importType,
          specifiers,
          line: node.loc ? node.loc.start.line : null
        });
      },

      // 2. Re-exports: export { a } from './b';
      ExportNamedDeclaration({ node }) {
        if (!node.source || !node.source.value) return;
        const sourceValue = node.source.value.trim();

        const specifiers = (node.specifiers || []).map((spec) => ({
          type: 're_export_named',
          local: spec.local?.name,
          exported: spec.exported?.name || spec.exported?.value
        }));

        imports.push({
          source: sourceValue,
          type: 're_export',
          specifiers,
          line: node.loc ? node.loc.start.line : null
        });
      },

      // 3. Export all: export * from './b';
      ExportAllDeclaration({ node }) {
        if (!node.source || !node.source.value) return;
        imports.push({
          source: node.source.value.trim(),
          type: 're_export_all',
          specifiers: [{ type: 'all' }],
          line: node.loc ? node.loc.start.line : null
        });
      },

      // 4. CommonJS require() and dynamic import()
      CallExpression({ node }) {
        // require('...')
        if (
          node.callee &&
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments &&
          node.arguments.length === 1
        ) {
          const arg = node.arguments[0];
          if (arg.type === 'StringLiteral') {
            imports.push({
              source: arg.value.trim(),
              type: 'cjs_require',
              specifiers: [{ type: 'cjs' }],
              line: node.loc ? node.loc.start.line : null
            });
          }
        }

        // dynamic import('...')
        if (
          node.callee &&
          node.callee.type === 'Import' &&
          node.arguments &&
          node.arguments.length >= 1
        ) {
          const arg = node.arguments[0];
          if (arg.type === 'StringLiteral') {
            imports.push({
              source: arg.value.trim(),
              type: 'dynamic_import',
              specifiers: [{ type: 'dynamic' }],
              line: node.loc ? node.loc.start.line : null
            });
          }
        }
      }
    });
  } catch (err) {
    // If AST traversal hit unexpected node structure
    return {
      imports,
      parseError: {
        message: `AST Traversal error: ${err.message}`,
        line: null,
        column: null
      }
    };
  }

  return { imports, parseError: null };
}
