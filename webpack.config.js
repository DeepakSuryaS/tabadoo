const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    background: "./src/background/background.js",
    popup: "./src/popup/popup.js",
    tabadoo: "./src/tabadoo/tabadoo.js",
    allTabs: "./src/allTabs/allTabs.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/popup/popup.html", to: "popup.html" },
        { from: "src/tabadoo/tabadoo.html", to: "tabadoo.html" },
        { from: "src/allTabs/allTabs.html", to: "allTabs.html" },
        { from: "src/allTabs/allTabs.css", to: "allTabs.css" },
        { from: "public/icons", to: "icons" },
      ],
    }),
  ],
};
