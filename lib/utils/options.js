const fs = require('fs');

// eslint-disable-next-line no-multi-assign
const rcPath = (exports.rcPath = getRcPath('.mvcrc'));

exports.defaultPresets = {
  features: ['babel', 'linter'],
  historyMode: false,
  eslintConfig: 'airbnb',
  lintOn: ['save'],
};

exports.defaults = {
  packageManage: undefined,
  useTaobaoRegister: undefined,
  presets: {
    default: {
      ...exports.defaultPresets,
    },
  },
};

let cachedOptions;

exports.loadOptions = () => {
  if (cachedOptions) {
    return cachedOptions;
  }

  if (fs.existsSync(rcPath)) {
    try {
      cachedOptions = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
    } catch (err) {
      error(
        `Error loading saved perferences: ` +
          `~/.mvcrc may be corrupted or have syntax errors. ` +
          `Please fix/delete it and re-run vue-cli in manual mode. \n` +
          `(${err.message})`
      );
      exit(1);
    }

    return cachedOptions;
  }

  return {};
};
