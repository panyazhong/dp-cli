const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const inquirer = require('inquirer');
const PromptModuleAPI = require('./PromptModuleAPI');
const Creator = require('./Creator');
const Generator = require('./Generator');
const clearConsole = require('./utils/clearConsole');
const { saveOptions, savePreset, rcPath } = require('./utils/options');
const { log } = require('./utils/logger');
const PackageManager = require('./PackageManager');

async function create(name) {
  const targetDir = path.join(process.cwd(), name);
  // 如果目标目录已存在，询问是覆盖还是合并
  if (fs.existsSync(targetDir)) {
    // 清空控制台
    clearConsole();

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
      await fs.remove(targetDir);
    }
  }

  const creator = new Creator();
  // 获取各个模块的交互提示语
  const promptModules = getPromptModules();
  console.log('create-promptModules:', promptModules);
  const promptAPI = new PromptModuleAPI(creator);
  promptModules.forEach((m) => {
    m(promptAPI);
  });

  // 清空控制台
  clearConsole();

  // 弹出交互提示语并获取用户的选择
  const answers = await inquirer.prompt(creator.getFinalPrompts());

  console.log('create-answers:', answers);
  if (answers.preset !== '__manual__') {
    const preset = creator.getPresets()[answers.preset];
    Object.keys(preset).forEach((key) => {
      answers[key] = preset[key];
    });
  }

  if (answers.packagemanager) {
    saveOptions({
      packagemanager: answers.packagemanager,
    });
  }

  if (
    answers.save &&
    answers.saveName &&
    savePreset(answers.saveName, answers)
  ) {
    log();
    log(
      `Preset ${chalk.yellow(answers.saveName)} saved in ${chalk.yellow(
        rcPath
      )}`
    );
  }

  const pm = new PackageManager(targetDir, answers.packageManager);

  // package.json
  const pkg = {
    name,
    version: '0.1.0',
    dependencies: {},
    devDependencies: {},
  };

  console.log(targetDir);
  const generator = new Generator(pkg, targetDir);

  //填入vue webpack必选项， 无需用户选择
  answers.features.unshift('vue', 'webpack');

  // 根据用户选择的选项加载对应的模块，在package.json写入对应的依赖项
  // 并且将对应的template模块渲染
  console.log('create-answers:', answers);
  answers.features.forEach((feature) => {
    require(`./generator/${feature}`)(generator, answers);
  });

  await generator.generate();

  // 下载依赖
  await pm.install();
  log(`\n依赖下载完成！执行下列命令开始开发：\n`);
  log(`cd ${name}`);
  log(`${pm.bin === 'npm' ? 'npm run' : 'yarn'} dev`);
}

function getPromptModules() {
  return ['babel', 'router', 'vuex', 'linter'].map((file) =>
    require(`./promptModules/${file}`)
  );
}

module.exports = create;
