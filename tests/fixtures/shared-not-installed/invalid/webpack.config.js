const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteMissing',
      shared: {
        lodash: { singleton: true, requiredVersion: '^4.17.0' },
      },
    }),
  ],
};
