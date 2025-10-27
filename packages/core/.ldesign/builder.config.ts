export default {
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
    umd: {
      dir: 'dist',
      name: 'PDFCore'
    }
  },
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
  external: [
    'pdfjs-dist',
    /^pdfjs-dist\//
  ]
}
