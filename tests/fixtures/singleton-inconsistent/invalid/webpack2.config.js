const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app2',
      shared: {
        react: { singleton: false },
      },
    }),
  ],
};