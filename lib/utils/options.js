const fs = require('fs');
const cloneDeep = require('lodash.clonedeep');
const { getRcPath } = require('./rcPath');
const { error } = require('./logger');

// eslint-disable-next-line no-multi-assign
const rcPath = (exports.rcPath = getRcPath('.dprc'));

exports.defaultPresets = {
  features: ['babel', 'linter'],
  historyMode: false,
  eslintConfig: 'airbnb',
  lintOn: ['save'],
};

exports.defaults = {
  packageManage: undefined,
  useTaobaoRegistry: undefined,
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

exports.saveOptions = (toSave) => {
  const options = Object.assign(cloneDeep(exports.loadOptions()), toSave);
  for (const key in options) {
    if (!(key in exports.defaults)) {
      delete options[key];
    }
  }

  cachedOptions = options;
  try {
    fs.writeFileSync(rcPath, JSON.stringify(options, null, 2));
    return true;
  } catch (e) {
    error(
      `Error saving preferences: ` +
        `make sure you have write access to ${rcPath}.\n` +
        `(${e.message})`
    );
  }
};
