const readline = require('readline');

//清空控制台
module.exports = function clearConsole(title) {
  if (process.env.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows);
    console.log('clearConsole-blank:', blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    if (title) {
      console.log('clearConsole-title:', title);
    }
  }
};
