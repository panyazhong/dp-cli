const execa = require('execa');

module.exports = function executeCommand(command, args, cwd) {
  return new Promise(async (resolve, reject) => {
    console.log('execa start');
    console.log(args);
    try {
      const { stdout } = await execa(command, args, {
        cwd,
        stdio: ['inherit', 'pipe'],
      });

      console.log(stdout);

      // const { stdout } = await execa(command, args, {
      //   cwd,
      //   stdio: ['inherit', 'pipe'],
      // });
      // console.log('cwd:', stdout);
      // stdout.on('data', (buffer) => {
      //   const str = buffer.toString();

      //   if (/warning/.test(str)) {
      //     return;
      //   }

      //   process.stdout.write(buffer);
      // });

      // child.on('close', (code) => {
      //   if (code !== 0) {
      //     reject(new Error(`command failed: ${command}`));
      //     return;
      //   }

      //   resolve();
      // });
    } catch (error) {
      console.log('try error:', error);
    }
  });
};
