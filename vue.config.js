module.exports = {
  pwa: {
    name: 'DerivePass',
    themeColor: '#3D79DE',
    msTileColor: '#3d79de',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    },
  },
  chainWebpack: config => {
    const rule = config.module.rule('svg')

    rule.uses.clear();
    rule
      .use('url-loader')
        .loader('url-loader')
        .end();
  },
}
