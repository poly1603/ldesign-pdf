module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'jsdoc',
    'import',
    'promise',
    'unicorn'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:promise/recommended'
  ],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    // TypeScript 规则
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowDirectConstAssertionInArrowFunctions: true
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_',
    }],
    '@typescript-eslint/strict-boolean-expressions': ['error', {
      allowNullableObject: true,
      allowNullableBoolean: true
    }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    
    // 命名规范
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false
        }
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase']
      },
      {
        selector: 'class',
        format: ['PascalCase']
      },
      {
        selector: 'enum',
        format: ['PascalCase']
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE']
      },
      {
        selector: 'variable',
        modifiers: ['const'],
        format: ['camelCase', 'PascalCase', 'UPPER_CASE']
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase']
      },
      {
        selector: 'method',
        format: ['camelCase']
      },
      {
        selector: 'property',
        format: ['camelCase'],
        leadingUnderscore: 'allow'
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow'
      }
    ],
    
    // 代码质量
    'complexity': ['warn', 15],
    'max-lines-per-function': ['warn', {
      max: 100,
      skipBlankLines: true,
      skipComments: true
    }],
    'max-depth': ['warn', 4],
    'max-nested-callbacks': ['warn', 3],
    'max-params': ['warn', 5],
    
    // 通用规则
    'no-console': ['warn', {
      allow: ['warn', 'error']
    }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'warn',
    'prefer-arrow-callback': 'warn',
    'no-param-reassign': ['error', {
      props: false
    }],
    
    // Import 规则
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }],
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',
    'import/no-default-export': 'warn',
    
    // JSDoc规则
    'jsdoc/require-jsdoc': ['warn', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
        ArrowFunctionExpression: false,
        FunctionExpression: false
      },
      contexts: [
        'TSMethodSignature',
        'TSPropertySignature'
      ]
    }],
    'jsdoc/require-description': 'warn',
    'jsdoc/require-param': 'warn',
    'jsdoc/require-returns': 'warn',
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/check-types': 'error',
    
    // Promise规则
    'promise/always-return': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-nesting': 'warn',
    
    // Unicorn规则（部分）
    'unicorn/better-regex': 'warn',
    'unicorn/no-array-for-each': 'warn',
    'unicorn/no-null': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/filename-case': ['warn', {
      cases: {
        camelCase: true,
        pascalCase: true
      }
    }]
  },
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'max-lines-per-function': 'off'
      }
    }
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  }
};