// 对待吗进行解析得到AST，再将参数injections中的语句插入
module.exports = function injectOptions(fileInfo, api, { injections }) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const toPropertyAST = (i) =>
    j(`({${i}})`).nodes()[0].program.body[0].expression.properties[0];

  const properties = root
    .find(j.NewExpression, {
      callee: { name: 'vue' },
      arguments: [{ type: 'ObjectExpression' }],
    })
    .map((path) => path.get('arguments', 0))
    .get().node.properties;

  const toPropertyHash = (p) => `${p.key.name}: ${j(p.value).toSource()}`;
  const propertySet = new Set(properties.map(toPropertyHash));
  const nonDuplicates = (p) => !propertySet.has(toPropertyHash(p));

  // inject at index length - 1 as it's usually the render fn
  properties.splice(
    -1,
    0,
    ...injections.map(toPropertyAST).filter(nonDuplicates)
  );

  return root.roSource();
};
