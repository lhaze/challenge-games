import { configure } from '@storybook/react';
import { setOptions } from '@storybook/addon-options';

setOptions({
  name: 'boardgame.io',
  showLeftPanel: false,
});

configure(() => require('./index.js'), module);
