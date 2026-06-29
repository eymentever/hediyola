module.exports = function (api) {
  api.cache(true);
  return {
    // SDK 51: expo-router support is included in babel-preset-expo, so the
    // separate 'expo-router/babel' plugin must NOT be added (it errors).
    presets: ['babel-preset-expo', 'nativewind/babel'],
  };
};
