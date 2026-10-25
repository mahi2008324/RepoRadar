import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSourceImports } from '../src/services/importParser.js';

describe('AST Import Parser', () => {
  it('should parse default and named ES imports', () => {
    const code = `
      import React, { useState, useEffect as useEff } from 'react';
      import Header from './components/Header';
    `;
    const { imports, parseError } = parseSourceImports(code, 'App.jsx');
    assert.strictEqual(parseError, null);
    assert.strictEqual(imports.length, 2);

    assert.strictEqual(imports[0].source, 'react');
    assert.strictEqual(imports[1].source, './components/Header');
    assert.strictEqual(imports[1].type, 'es_default');
  });

  it('should parse namespace and side-effect imports', () => {
    const code = `
      import * as utils from './utils/math';
      import './styles/global.css';
    `;
    const { imports, parseError } = parseSourceImports(code, 'index.js');
    assert.strictEqual(parseError, null);
    assert.strictEqual(imports.length, 2);

    assert.strictEqual(imports[0].type, 'es_namespace');
    assert.strictEqual(imports[0].source, './utils/math');

    assert.strictEqual(imports[1].type, 'es_side_effect');
    assert.strictEqual(imports[1].source, './styles/global.css');
  });

  it('should parse re-exports and export *', () => {
    const code = `
      export { Button, Card as UiCard } from './components/ui';
      export * from './helpers';
    `;
    const { imports, parseError } = parseSourceImports(code, 'index.ts');
    assert.strictEqual(parseError, null);
    assert.strictEqual(imports.length, 2);

    assert.strictEqual(imports[0].type, 're_export');
    assert.strictEqual(imports[0].source, './components/ui');

    assert.strictEqual(imports[1].type, 're_export_all');
    assert.strictEqual(imports[1].source, './helpers');
  });

  it('should parse CommonJS require and dynamic import', () => {
    const code = `
      const express = require('express');
      const config = require('./config/app');
      async function load() {
        const mod = await import('./lazyModule');
      }
    `;
    const { imports, parseError } = parseSourceImports(code, 'server.js');
    assert.strictEqual(parseError, null);
    assert.strictEqual(imports.length, 3);

    assert.strictEqual(imports[0].type, 'cjs_require');
    assert.strictEqual(imports[0].source, 'express');

    assert.strictEqual(imports[1].type, 'cjs_require');
    assert.strictEqual(imports[1].source, './config/app');

    assert.strictEqual(imports[2].type, 'dynamic_import');
    assert.strictEqual(imports[2].source, './lazyModule');
  });

  it('should support TypeScript type annotations and JSX syntax', () => {
    const code = `
      import type { UserProps } from './types';
      import { FC } from 'react';

      interface Props extends UserProps {
        isActive: boolean;
      }

      export const Profile: FC<Props> = ({ isActive }) => {
        return <div className="user">{isActive ? 'Active' : 'Offline'}</div>;
      };
    `;
    const { imports, parseError } = parseSourceImports(code, 'Profile.tsx');
    assert.strictEqual(parseError, null);
    assert.ok(imports.some((i) => i.source === './types'));
  });

  it('should gracefully report syntax errors without crashing', () => {
    const malformedCode = `
      import { something from './nowhere'
      const broken = ;
    `;
    const { imports, parseError } = parseSourceImports(malformedCode, 'broken.js');
    assert.strictEqual(imports.length, 0);
    assert.ok(parseError !== null);
    assert.ok(typeof parseError.message === 'string');
  });
});
