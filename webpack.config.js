module.exports = {
   entry: './admin/src/BaseView.js',
   output: {
      path: './admin/build',
      filename: 'everything.js'
   },
   module: {
      loaders: [
         {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
               presets: ['es2015', 'react']
            }
         },
         { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
         { test: /\.css$/, loader: 'style-loader!css-loader' },
         { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }
      ]
   }
};
