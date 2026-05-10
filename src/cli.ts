#!/usr/bin/env node

import cac from 'cac';

const cli = cac('mfe-doctor');

cli.command('analyze', 'Analyze Module Federation configs').action(() => {
  console.log('mfe-doctor analyze: not implemented yet');
});

cli.help();
cli.version('0.1.0');

cli.parse();
