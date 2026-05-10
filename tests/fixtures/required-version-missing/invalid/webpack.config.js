const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteMissingVersion',
      shared: {
        rxjs: { singleton: true },
      },
    }),
  ],
};
