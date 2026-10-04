const { defineConfig } = require('@vue/cli-service')
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      // Auto-import des composants/directives Vuetify 3 (tree-shaking)
      new VuetifyPlugin({ autoImport: true })
    ]
  }
})
