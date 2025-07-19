const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "none",
  entry: "./src/main.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `
// ==UserScript==
// @name cross-link
// @version 0.1.0
// @grant GM.xmlHttpRequest
// @grant GM.notification
// @include https://store.steampowered.com/app/*
// ==/UserScript==
`.trim(),
      raw: true,
    }),
  ],
};
