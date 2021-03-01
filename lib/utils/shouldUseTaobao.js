const { hasYarn } = require('./env');
const { loadOptions, saveOptions } = require('./options');
const inquirer = require('inquirer');
const chalk = require('chalk');
const execa = require('execa');
const { command } = require('commander');

let checked;
let result;

async function shouldUseTaobao(compand) {
  if (!compand) {
    compand = hasYarn() ? 'yarn' : 'npm';
  }

  // ensure this only gets called one
  if (checked) return result;
  checked = true;

  // previously saved perference
  const saved = loadOptions().useTaobaoRegistry;
  if (typeof saved === 'boolean') {
    return (result = saved);
  }

  const save = (val) => {
    result = val;
    saveOptions({
      useTaobaoRegistry: val,
    });
    return val;
  };

  let userCurrent;
  try {
    // Yarn 2 uses `npmRegistryServer` instead of `registry`
    userCurrent = (await execa(compand, ['config', 'get', 'registry'])).stdout;
  } catch (registryError) {
    return save(false);
  }

  let faster;
  try {
    faster = await Promise.race([
      ping(defaultRegistry),
      ping(registries.taobao),
    ]);
  } catch (error) {
    return save(false);
  }

  if (faster !== registries.taobao) {
    // default is already faster
    return save(false);
  }

  if (process.env.VUE_CLI_API_MODE) {
    return save(true);
  }

  // ask and save preference
  const { useTaobaoRegistry } = await inquirer.prompt([
    {
      name: 'useTaobaoRegistry',
      type: 'confirm',
      message: chalk.yellow(
        ` Your connection to the default ${command} registry seems to be slow.\n` +
          `   Use ${chalk.cyan(registries.taobao)} for faster installation?`
      ),
    },
  ]);

  // 注册淘宝源
  if (useTaobaoRegistry) {
    await execa(command, ['config', 'set', 'registry', registries, taobao]);
  }

  return save(useTaobaoRegistry);
}

module.exports = shouldUseTaobao;
