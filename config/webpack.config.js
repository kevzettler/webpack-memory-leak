const path = require('path');
const ThreadsPlugin = require('threads-plugin')
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const env = require('./env.js');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  mode: 'production',

  devServer:{
    contentBase: path.resolve(__dirname, '../public'),
    publicPath: '/',
    port: 3000,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options:{
            configFile: path.resolve(__dirname, '../web.tsconfig.json'),
          }
        }
      },

      // Kiwi Schemas
      // https://github.com/evanw/kiwi
      {
        test: /\.kiwi$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
        ]
      },

      // GLSL files
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        use: [
          'glslify-import-loader',
          'raw-loader',
          'glslify-loader',
        ]
      },

      {
        test: /\.(png|jpeg)$/,
        exclude: /node_modules/,
        use: [
          'arraybuffer-loader',
        ]
      },

      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader turns CSS into JS modules that inject <style> tags.
      // In production, we use a plugin to extract that CSS to a file, but
      // in development "style" loader enables hot editing of CSS.
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
              //localIdentName: "[name]__[local]___[hash:base64:5]"
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions:{
                plugins: [
                  'postcss-flexbugs-fixes',
                  autoprefixer({
                    flexbox: 'no-2009',
                  }),
                ],
              }
            },
          },
        ],
      },

    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../build'),
  },

  plugins:[
    new webpack.EnvironmentPlugin(env),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    new ThreadsPlugin({
      globalObject: 'self'
    })
  ],
};
