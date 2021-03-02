const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const xdgConfigPath = (file) => {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    const rcDir = path.join(xdgConfigHome, 'vue');
    if (!fs.existsSync(rcDir)) {
      fs.ensureDirSync(rcDir, 0o700);
    }

    return path.join(rcDir, file);
  }
};

const migrateWindowsConfigPath = (file) => {
  if (process.platform !== 'win32') {
    return;
  }

  const appData = process.env.APPDATA;
  if (appData) {
    const rcDir = path.join(appData, 'vue');
    const rcFile = path.join(rcDir, file);
    const properRcFile = path.join(os.homedir(), file);
    if (fs.existsSync(rcFile)) {
      try {
        if (fs.existsSync(properRcFile)) {
          fs.removeSync(rcFile);
        } else {
          fs.moveSync(rcFile, properRcFile);
        }
        // eslint-disable-next-line no-empty
      } catch (error) {}
    }
  }
};

exports.getRcPath = (file) => {
  migrateWindowsConfigPath(file);
  console.log('rcPath-process-env:', process.env.VUE_CLI_CONFIG_PATH);
  console.log('rcPath-cdgConfigPath:', xdgConfigPath(file));
  console.log('rcPath-os-homeDir', path.join(os.homedir(), file));
  return (
    process.env.VUE_CLI_CONFIG_PATH ||
    xdgConfigPath(file) ||
    path.join(os.homedir(), file)
  );
};
