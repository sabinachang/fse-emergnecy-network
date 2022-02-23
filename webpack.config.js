const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV,
  devtool:
    process.env.NODE_ENV === 'development'
      ? 'cheap-module-eval-source-map'
      : false,
  entry: {
    'join-community': './client/pages/join-community/join-community.js',
    common: './client/common/common.js',
    users: './client/pages/users/users.js',
    channels: './client/pages/channels/channels.js',
    channel: './client/pages/channel/channel.js',
    shelters: './client/pages/shelters/shelters.js',
    'shelter-detail': './client/pages/shelter-detail/shelter-detail.js',
    emergencies: './client/pages/emergencies/emergencies.js',
    map: './client/pages/map/map.js',
    'user-profile': './client/pages/user-profile/user-profile.js',
    'match-posts': './client/pages/match-posts/match-posts.js',
    qualifications: './client/pages/qualifications/qualifications.js',
  },
  devServer: {
    hot: true,
    quiet: false,
    stats: {
      colors: true,
      modules: false,
    },
    watchOptions: {
      ignored: /(node_modules)/,
    },
    disableHostCheck: true,
    proxy: {
      '/': `http://localhost:${6002}`,
      '/socket.io': {
        target: `http://localhost:${6002}`,
        ws: true,
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ].filter((p) => !!p),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[ext]',
              limit: 8192, // bytes
            },
          },
        ],
      },
    ],
  },
};
