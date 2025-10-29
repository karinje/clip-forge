const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mainConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/main/index.ts',
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'index.js',
  },
  externals: {
    '@ffmpeg-installer/ffmpeg': 'commonjs @ffmpeg-installer/ffmpeg',
    'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.main.json',
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};

const preloadConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/preload/index.ts',
  target: 'electron-preload',
  output: {
    path: path.resolve(__dirname, 'dist/preload'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.main.json',
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};

const rendererConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.webpack.json',
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/renderer'),
    },
    port: 3000,
    hot: true,
  },
};

module.exports = [mainConfig, preloadConfig, rendererConfig];

