module.exports = (generator) => {
  // 向入口文件 `src/main.js` 注入代码 import store from './store'
  generator.injectImports(generator.entryFile, `import store from './store'`);

  // 向入口文件 `src/main.js` 的 new Vue() 注入选项 store
  generator.injectRootOptions(generator.entryFile, `store`);

  // 注入依赖
  generator.extendPackage({
    dependencies: {
      vuex: '^3.6.2',
    },
  });

  // 渲染模板
  generator.render('./template', {});
};
