const { ModuleFederationPlugin } = require('webpack').container;

module.exports = [
  {
    name: 'clientConfig',
    plugins: [
      new ModuleFederationPlugin({
        name: 'client',
        exposes: { './A': './src/A.js' },
      }),
    ],
  },
  {
    name: 'serverConfig',
    plugins: [
      new ModuleFederationPlugin({
        name: 'server',
        exposes: { './B': './src/B.js' },
      }),
    ],
  },
];
