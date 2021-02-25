class Creator {
  constructor() {
    this.featurePrompt = {
      name: 'features',
      message: 'Check the features needed for your project:',
      pageSize: 10,
      type: 'checkbox',
      choices: [],
    };

    this.injectedPrompts = [];
  }

  getFinalPrompts() {
    this.injectedPrompts.forEach((prompt) => {
      const originWhen = prompt.when || (() => true);
      prompt.when = (answers) => originWhen(answers);
    });

    const prompts = [this.featurePrompt, ...this.injectedPrompts];

    return prompts;
  }
}

module.exports = Creator;
