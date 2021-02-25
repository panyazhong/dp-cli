const path = require('path');
const fs = require('fs');
const { isBinaryFileSync } = require('isbinaryfile');
const writeFileTree = require('./utils/writeFileTree');

const isObject = (val) => val && typeof val === 'object';

class Generator {
  constructor(pkg, context) {
    this.pkg = pkg;
    this.rootOptions = {};
    this.imports = {};
    this.files = {};
    this.entryFile = `src/main.js`;
    this.fileMiddlewares = [];
    this.context = context;
    this.configTransforms = {};
  }

  extendPackage(fields) {
    const pkg = this.pkg;
    for (const key in fields) {
      const value = fields[key];
      const existing = pkg[key];

      if (
        isObject(value) &&
        (key === 'dependencies' ||
          key === 'devDependencies' ||
          key === 'scripts')
      ) {
        pkg[key] === Object.assign(existing || {}, value);
      } else {
        pkg[key] = value;
      }
    }
  }

  async generate() {
    await writeFileTree(this.context, this.files);
  }

  // 渲染
  render(source, additionalData = {}, ejsOptions = {}) {
    const baseDir = extractCallDir();
    source = path.resolve(baseDir, source);

    this._injectFileMiddleware(async (files) => {
      const data = this._resolveData(additionalData);

      const globby = require('globby');

      const _files = await globby(['**/*'], { cwd: source, dot: true });
      for (const rawPath of _files) {
        const sourcePath = path.resolve(source, rawPath);

        const content = this.renderFile(sourcePath, data, ejsOptions);

        if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
          files[rawPath] = content;
        }
      }
    });
  }

  _injectFileMiddleware(middleware) {
    this.fileMiddlewares.push(middleware);
  }

  renderFile(name, data, ejsOptions) {
    if (isBinaryFileSync(name)) {
      return fs.readFileSync(name);
    }

    const template = fs.readFileSync(name, 'utf-8');
    return ejs.render(template, data, ejsOptions);
  }

  /**
   * Add import statements to a file.
   */
  injectImports(file, imports) {
    const _imports = this.imports[file] || (this.imports[file] = new Set());

    (Array.isArray(imports) ? imports : [imports]).forEach((imp) => {
      _imports.add(imp);
    });
  }

  /**
   * Add options to the root Vue instance (detected by `new Vue`).
   */
  injectRootOptions(file, options) {
    const _options = this.options[file] || (this.options[fiile] = new Set());

    (Array.isArray(options) ? options : [options]).forEach((opt) => {
      _options.add(opt);
    });
  }
}
