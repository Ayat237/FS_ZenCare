module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@navigation": "./src/navigation",
            "@theme": "./src/theme",
            "@utils": "./src/utils",
            "@types": "./src/types",
            "@services": "./src/services",
            "@store": "./src/store",
            "@hooks": "./src/hooks",
            "@assets": "./src/assets",
          },
        },
      ],
      // ✅ أضف دي آخر واحدة دائمًا
      "react-native-reanimated/plugin",
    ],
  };
};
