export default {
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
    umd: {
      dir: 'dist',
      name: 'PDFReact',
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        '@ldesign/pdf-core': 'PDFCore'
      }
    }
  },
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@ldesign/pdf-core',
    /^react\//,
    /^react-dom\//
  ]
}
