const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('webpack-dev', {
  resolve: {
    alias: {
      // Within this app, we can use '@src/foo instead of relative URLs like '../../../foo'
      '@src': path.resolve(__dirname, 'src/'),
    },
    fallback: {
      fs: false,
      constants: false,
    },
  },
});

module.exports = config;
