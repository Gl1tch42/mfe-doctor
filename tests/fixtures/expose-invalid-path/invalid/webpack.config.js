const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteInvalid',
      exposes: {
        './Widget': './src/components/MissingWidget.ts',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};
