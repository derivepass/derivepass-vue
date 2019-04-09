const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

module.exports = {
  pwa: {
    name: 'DerivePass',
    themeColor: '#3D79DE',
    msTileColor: '#3d79de',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      importWorkboxFrom: 'local',
      swSrc: 'src/plugins/service-worker/service-worker.js',
    },
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  },

  configureWebpack: {
    plugins: [
      new CspHtmlWebpackPlugin({
        'default-src': '\'self\'',
        'script-src': '\'self\'',
        'img-src': [ '\'self\'', 'data:' ],
        'style-src': [ '\'self\'', '\'unsafe-inline\'' ],
        'connect-src': [ '\'self\'', 'data:', 'https://api.apple-cloudkit.com' ],
      }, {
        enabled: () => {
          // Dev builds should be possible to run locally!
          return process.env.NODE_ENV !== 'development';
        },

        // TODO(indutny): reconsider those
        hashEnabled: {
          'script-src': false,
          'style-src': false,
        },
        nonceEnabled: {
          'script-src': false,
          'style-src': false,
        },
      }),
    ],
  },
}
