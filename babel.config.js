module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@realm/babel-plugin',
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.json',
          '.tsx',
          '.ts',
          '.native.js',
        ],
        alias: {
          '@': './src',
          '@core': './src/core',
          '@features': './src/features',
          '@shared': './src/shared',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
