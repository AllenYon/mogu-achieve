var webpack = require('webpack');

module.exports = {
  entry: {
    app: ['./app.js']
  },
  // vendor: ['react', 'redux', 'redux-logger', 'react-router', 'react-redux', 'redux-thunk', 'history', 'react-dom', 'react-bootstrap']
  watch: true,
  output: {
    // path: './dev/client',
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{ test: /\.jsx?$/, loader: 'babel-loader' }, { test: /\.(gif|jpg|png)$/, loader: 'url-loader?limit=1000' }, { test: /\.scss$/, loader: 'style!css!sass' }]
  },
  devtool: 'source-map',
  plugins: [
  // 把 vendor 里的 JS 单独打出来
  new webpack.optimize.CommonsChunkPlugin( /* chunkName= */'vendor', /* filename= */'vendor.bundle.js'),
  // Uglify 时不要再输出 warning 了···
  new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }),
  // 添加环境变量，区分浏览器和服务端
  new webpack.DefinePlugin({
    'process.env': {
      BROWSER: JSON.stringify(true)
    }
  })]
};