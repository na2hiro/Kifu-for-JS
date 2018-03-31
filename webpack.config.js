const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const package = require('./package.json');

module.exports = env => {
    const IS_PROD = env && env.production;
    const BUNDLE_DIR = path.resolve(__dirname, './bundle');
    const common = {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
    //                            "@babel/preset-es2015",
                                "@babel/preset-es2017",
                                "@babel/preset-react",
                                [
                                    "@babel/preset-env",
                                    {
                                        useBuiltIns: "usage",
                                    }
                                ],
                            ],
                            plugins: [
                                //"add-module-exports",
                                "syntax-dynamic-import",
                                "transform-decorators-legacy",
                                "transform-regenerator",
                            ],
                        },
                    }
                },
                {
                    test: /\.css/,
                    use: [
                        'style-loader',
                        'css-loader'
                    ]
                }
            ]
        },
        resolve: {
            extensions: ['.js']
        },
        plugins: [
            new CleanWebpackPlugin([BUNDLE_DIR]),
        ]
    };

    if (IS_PROD){
        common.plugins.push(new webpack.optimize.UglifyJsPlugin());
    } else {
        common.devServer = {
            progress: true,
        };
        common.devtool = "cheap-module-eval-source-map";
    }


    // For browsers
    const bundle = merge(common, {
        entry: path.resolve(__dirname, './src/index.js'),
        output: {
            library: "KifuForJS",
            filename: IS_PROD ? `kifu-for-js-${package.version}.min.js` : 'kifu-for-js.js',
            path: BUNDLE_DIR,
            publicPath: "/bundle/"
        },
    });

    // For bookmarklets
    const bookmarklets = merge(common, {
        entry: {
            "bookmarklet": path.resolve(__dirname, './src/bookmarklet.js'),
            "public-bookmarklet": path.resolve(__dirname, './src/public-bookmarklet.js'),
        },
        output: {
            filename: `[name].min.js`,
            chunkFilename: `[name].min.js`,
            path: BUNDLE_DIR,
            publicPath: IS_PROD ? "https://na2hiro.github.io/Kifu-for-JS/" : "http://localhost:8081/bundle/"
        },
    });

    return [bundle, bookmarklets];
};
