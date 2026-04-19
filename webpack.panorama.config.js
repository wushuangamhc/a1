const path = require("path");

module.exports = {
  mode: "development",
  devtool: false,
  entry: {
    "manifest_scripts/init": "./src/panorama/manifest_scripts/init.ts",
    "manifest_scripts/camera": "./src/panorama/manifest_scripts/camera.ts",
    hud: "./src/panorama/hud.tsx",
    scoreboard: "./src/panorama/scoreboard.tsx",
    endgame: "./src/panorama/endgame.tsx"
  },
  output: {
    path: path.resolve(__dirname, "content/A1/panorama/scripts/custom_game"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@shared": path.resolve(__dirname, "shared"),
      "@panorama": path.resolve(__dirname, "src/panorama")
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.panorama.json"
        }
      }
    ]
  }
};
