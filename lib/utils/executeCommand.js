const execa = require('execa');

module.exports = function executeCommand(command, cwd) {
  return new Promise(async (resolve, reject) => {
    console.log('execa start');
    try {
      execa('echo', ['hello world']).then((result) => {
        console.log(result);
        //=> 'hello world'
      });
      // const { stdout } = await execa(command, [], {
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
      // stderr.on('error', (e) => {
      //   console.log('err:', e);
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
