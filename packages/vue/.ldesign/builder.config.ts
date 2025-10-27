export default {
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
    umd: { enabled: false }
  },
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
  external: [
    'vue',
    '@ldesign/pdf-core',
    /^vue\//
  ]
}
