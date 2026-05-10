const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteValid',
      shared: {
        lodash: { singleton: true, requiredVersion: '^4.17.0' },
      },
    }),
  ],
};
