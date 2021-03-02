const { hasYarn } = require('./utils/env');

const { loadOptions, defaults } = require('./utils/options');
const isManualMode = (answers) => answers.preset === '__manual__';

class Creator {
  constructor() {
    this.injectedPrompts = [];
    const { presetPrompt, featurePrompt } = this.getDefaultPrompts();
    this.presetPrompt = presetPrompt;
    this.featurePrompt = featurePrompt;
  }

  getFinalPrompts() {
    console.log('Creator-injectedPrompts:', this.injectedPrompts);
    this.injectedPrompts.forEach((prompt) => {
      const originWhen = prompt.when || (() => true);
      prompt.when = (answers) => isManualMode(answers) && originWhen(answers);
    });

    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.getOtherPrompts(),
    ];

    console.log('Creator-final-prompts:', prompts);
    return prompts;
  }

  getPresets() {
    // 读取 ‘.pdrc’ 文件
    const savedOptions = loadOptions();
    console.log('Creator-savedOptions:', savedOptions);
    console.log('Creator-savedOptions.presets:', savedOptions.presets);
    console.log('Creator-defaults.presets:', defaults.presets);
    return {
      ...savedOptions.presets,
      ...defaults.presets,
    };
  }

  getDefaultPrompts() {
    const presets = this.getPresets();
    console.log('Creator-presets:', presets);
    const presetChoices = Object.entries(presets).map(([name, preset]) => {
      let displayName = name;
      console.log('Creator-entries-name:', name);
      console.log('Creator-entries-preset:', preset);
      return {
        name: `${displayName} (${preset.features})`,
        value: name,
      };
    });

    console.log('Creator-presetChoices:', presetChoices);
    const presetPrompt = {
      name: 'preset',
      type: 'list',
      message: 'Please pick a preset:',
      choices: [
        ...presetChoices,
        {
          name: 'Manually select features',
          value: '__manual__',
        },
      ],
    };

    const featurePrompt = {
      name: 'features',
      when: isManualMode,
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [],
      pageSize: 10,
    };

    return {
      presetPrompt,
      featurePrompt,
    };
  }

  getOtherPrompts() {
    const otherPrompts = [
      {
        name: 'save',
        when: isManualMode,
        type: 'confirm',
        message: 'Save this as a preset for future project?',
        default: false,
      },
      {
        name: 'saveName',
        when: (answers) => answers.save,
        type: 'input',
        message: 'Save preset as:',
      },
    ];

    // 读取 `.mvcrc` 文件
    const savedOptions = loadOptions();
    // 如果没有指定包管理器并且存在 yarn
    if (!savedOptions.packageManager && hasYarn) {
      const packageManagerChoices = [];

      console.log('Creator-hasyarn:', hasYarn());

      if (hasYarn()) {
        packageManagerChoices.push({
          name: 'Use yarn',
          value: 'yarn',
          short: 'Yarn',
        });
      }

      packageManagerChoices.push({
        name: 'Use npm',
        value: 'npm',
        short: 'NPM',
      });

      otherPrompts.push({
        name: 'packageManager',
        type: 'list',
        message:
          'Pick the package manager to use when installing dependencies:',
        choices: packageManagerChoices,
      });
    }
    return otherPrompts;
  }
}

module.exports = Creator;
