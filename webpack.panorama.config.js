const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    hud: "./content/panorama/src/hud.tsx",
    scoreboard: "./content/panorama/src/scoreboard.tsx",
    endgame: "./content/panorama/src/endgame.tsx"
  },
  output: {
    path: path.resolve(__dirname, "addon/content/panorama/scripts/custom_game"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@shared": path.resolve(__dirname, "shared"),
      "@panorama": path.resolve(__dirname, "content/panorama/src")
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
