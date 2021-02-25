const PromptModuleAPI = require('./PromptModuleAPI');
const Creator = require('./Creator');
const executeCommand = require('./utils/executeCommand');
const inquirer = require('inquirer');
const path = require('path');

const creator = new Creator();

async function create(name) {
  // 获取各个模块的交互提示语
  const promptModules = getPromptModules();
  const promptAPI = new PromptModuleAPI(creator);
  promptModules.forEach((m) => {
    m(promptAPI);
  });

  // clearConsole(e);

  const answers = await inquirer.prompt(creator.getFinalPrompts());
  console.log(answers);

  console.log('\n正在下载依赖...\n');
  await executeCommand('npm install', path.join(process.cwd(), name));
}

function getPromptModules() {
  return ['babel', 'router', 'vuex', 'linter'].map((file) =>
    require(`./promptModules/${file}`)
  );
}

module.exports = create;
