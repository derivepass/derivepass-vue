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
  }
}
