const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const {
  createSentryMetroSerializer,
} = require('@sentry/react-native/dist/js/tools/sentryMetroSerializer');

const {withSentryConfig} = require('@sentry/react-native/metro');

const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  serializer: {
    customSerializer: createSentryMetroSerializer(),
  },
};

module.exports = wrapWithReanimatedMetroConfig(
  withSentryConfig(mergeConfig(getDefaultConfig(__dirname), config)),
);
