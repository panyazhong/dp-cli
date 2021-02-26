const PromptModuleAPI = require('./PromptModuleAPI');
const Creator = require('./Creator');
const executeCommand = require('./utils/executeCommand');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

async function create(name) {
  const targetDir = path.join(process.cwd(), name);
  // 如果目标目录已存在，询问是覆盖还是合并
  if (fs.existsSync(targetDir)) {
    // 清空控制台

    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: `Target derectory ${chalk.cyan(
          targetDir
        )} already exists. Pick an action:`,
        choices: [
          {
            name: 'Overwrite',
            value: 'overwrite',
          },
          {
            name: 'Merge',
            value: 'merge',
          },
        ],
      },
    ]);

    if (action === 'overwrite') {
      console.log(`\nRemoving ${chalk.cyan(targetDir)}...`);
      await fs.rm(targetDir);
    }
  }

  const creator = new Creator();
  // 获取各个模块的交互提示语
  const promptModules = getPromptModules();
  const promptAPI = new PromptModuleAPI(creator);
  promptModules.forEach((m) => {
    m(promptAPI);
  });

  // 清空控制台
  // clearConsole(e);

  // 弹出交互提示语并获取用户的选择
  const answers = await inquirer.prompt(creator.getFinalPrompts());

  let { features } = answers;

  console.log('\n正在下载依赖...\n');
  await executeCommand('npm install', features, path.join(process.cwd(), name));
}

function getPromptModules() {
  return ['babel', 'router', 'vuex', 'linter'].map((file) =>
    require(`./promptModules/${file}`)
  );
}

module.exports = create;
