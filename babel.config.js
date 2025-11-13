module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: ['react-native-paper/babel'], // Paper plugin only for prod
      },
    },
    plugins: [
      'react-native-reanimated/plugin', // 👈 must be LAST
    ],
  };
};
