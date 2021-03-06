#!/usr/bin/env node
const program = require('commander');
const create = require('../lib/create');

program
  .version(require('../package.json').version)
  .usage('<command> [options]')
  .command('create <name>')
  .description('create a new project')
  .action((name) => {
    create(name);
  });
program.parse();
