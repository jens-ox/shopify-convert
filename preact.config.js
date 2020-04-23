import CopyWebpackPlugin from 'copy-webpack-plugin'

// derived from https://dev.to/boywithsilverwings/configuring-preact-cli-with-tailwind-css-3ckj
module.exports = (config, env, helpers, params) => {
  const purgecss = require('@fullhuman/postcss-purgecss')({
    // Specify the paths to all of the template files in your project
    content: ['./build/**/*.js', './build/**/*.html'],
    css: ['./build/**/*.css'],
    whitelist: ['body'],
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
  })

  const postCssLoaders = helpers.getLoadersByName(config, 'postcss-loader')
  postCssLoaders.forEach(({ loader }) => {
    const plugins = loader.options.plugins

    // Add tailwind css at the top.
    plugins.unshift(require('tailwindcss'))

    // Add PurgeCSS only in production.
    if (env.production) {
      plugins.push(purgecss)
    }
  })

  // copy static files to root
  config.plugins.push(new CopyWebpackPlugin([{ from: `./assets/static`, to: `../build/` }]))

  return config
}
