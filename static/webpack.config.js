var webpack = require('webpack');
var path = require('path');

var APP_DIR = path.resolve(__dirname, '.');
//var BUILD_DIR = path.resolve(__dirname, 'build');

var config = {
  entry: './index.jsx',
  output: {
    path: 'build',
    filename: 'bundle.js'
  },
  module : {
      loaders : [
        {
          test : /\.jsx?/,
          include : APP_DIR,
          exclude: /(node_modules|bower_components|components|build)/,
          loader : 'babel'
        }
      ]
    }
};

module.exports = config;
