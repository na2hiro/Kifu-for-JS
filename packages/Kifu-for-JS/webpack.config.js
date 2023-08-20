const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const pkg = require("./package.json");

const DEV_SERVER_PORT = 8080;

module.exports = (env) => {
    const IS_GHPAGES = env.ghpages;
    const IS_PROD = env.production; // Prod or dev
    const IS_ANALYZE = env.analyze;
    const IS_PROD_LOCAL = env.prodLocal; // To test prod build locally
    const BUNDLE_DIR = path.resolve(__dirname, "./bundle");
    const common = {
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                plugins: ["syntax-dynamic-import"],
                            },
                        },
                        "ts-loader",
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.s?css$/,
                    use: ["style-loader", "css-loader", "sass-loader"],
                },
                {
                    test: /\.png$/,
                    use: [
                        "url-loader",
                        {
                            loader: "img-loader",
                            options: {},
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: [".js", ".ts", ".tsx", ".png"],
        },
        plugins: [
            new webpack.DefinePlugin({
                __VERSION__: JSON.stringify(pkg.version),
            }),
            new webpack.BannerPlugin({
                banner: `Kifu for JS (${pkg.version})
Copyright (c) 2014 na2hiro (https://github.com/na2hiro)
This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php`,
            }),
        ],
    };

    if (IS_PROD) {
        common.optimization = {
            minimize: true,
        };
    } else {
        common.devtool = "eval-cheap-module-source-map";
    }

    if (IS_ANALYZE) {
        common.plugins.push(new BundleAnalyzerPlugin());
    }

    const commonMain = merge(common, {
        entry: {
            "kifu-for-js": path.resolve(__dirname, "./src/index.tsx"),
            "kifu-for-js-legacy": path.resolve(__dirname, "./src/index-legacy.tsx"),
        },
    });

    // For browsers
    const bundle = merge(commonMain, {
        output: {
            library: "KifuForJS",
            filename: `[name].min.js`,
            path: BUNDLE_DIR,
            publicPath: "/bundle/",
        },
        plugins: [new CleanWebpackPlugin([BUNDLE_DIR])],
        ...(IS_PROD
            ? {}
            : {
                  devServer: {
                      port: DEV_SERVER_PORT,
                      host: "0.0.0.0",
                      client: {
                          progress: true,
                      },
                      static: [
                          {
                              directory: BUNDLE_DIR,
                          },
                          {
                              directory: __dirname,
                          },
                      ],
                  },
              }),
    });

    // For npm module
    const DIST_DIR = path.resolve(__dirname, "./dist");
    const dist = merge(commonMain, {
        output: {
            libraryTarget: "commonjs2",
            filename: "[name].js",
            path: DIST_DIR,
        },
        plugins: [new CleanWebpackPlugin([DIST_DIR])],
        externals: {
            react: "react",
            reactDOM: "react-dom",
        },
    });

    // For bookmarklets
    const bookmarklets = merge(common, {
        entry: {
            bookmarklet: path.resolve(__dirname, "./src/bookmarklet.ts"),
            "public-bookmarklet": path.resolve(__dirname, "./src/public-bookmarklet.ts"),
        },
        output: {
            filename: `[name].min.js`,
            chunkFilename: `[name].min.js`,
            path: BUNDLE_DIR,
            publicPath: getPublicPath(),
        },
        optimization: {
            splitChunks: IS_GHPAGES ? false : undefined,
        },
    });

    return [bundle, dist, bookmarklets];

    function getPublicPath() {
        if (IS_PROD_LOCAL) {
            return `http://localhost:8081/bundle/`;
        } else if (IS_PROD) {
            return "https://na2hiro.github.io/Kifu-for-JS/out/";
        } else {
            return `http://localhost:${DEV_SERVER_PORT}/bundle/`;
        }
    }
};
