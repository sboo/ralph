module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@realm/babel-plugin',
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
        },
      },
    ],
  ],
};
