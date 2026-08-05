const path = require('path');
const webpack = require('webpack');
const WebpackDashDynamicImport = require('@plotly/webpack-dash-dynamic-import');
const packagejson = require('./package.json');

const dashLibraryName = packagejson.name.replace(/-/g, '_');

module.exports = (env, argv) => {
    let mode;

    // Self-reference, not a mistake: a sibling config can `require` this file, assign fields onto
    // the exported object, and re-export it (webpack.serve.config.js does exactly that). By the
    // time webpack calls this function those assignments are already on module.exports, so reading
    // them back here is how they get honoured - every setting below is "override, else default".
    const overrides = module.exports || {};

    // if user specified mode flag take that value
    if (argv && argv.mode) {
        mode = argv.mode;
    }

    // else if configuration object is already set (module.exports) use that value
    else if (overrides.mode) {
        mode = overrides.mode;
    }

    // else take webpack default (production)
    else {
        mode = 'production';
    }

    let filename = (overrides.output || {}).filename;
    if (!filename) {
        const modeSuffix = mode === 'development' ? 'dev' : 'min';
        filename = `${dashLibraryName}.${modeSuffix}.js`;
    }

    const entry = overrides.entry || {main: './src/lib/index.ts'};

    // false, not 'source-map': SourceMapDevToolPlugin below already emits maps explicitly (with the
    // async-plotlyjs exclude); enabling both here AND there makes webpack try to emit two different
    // .map files under the same name ("Multiple assets emit different content to the same filename")
    const devtool = overrides.devtool || false;

    const externals =
        'externals' in overrides
            ? overrides.externals
            : {
                  react: 'React',
                  'react-dom': 'ReactDOM',
                  'plotly.js': 'Plotly',
                  'prop-types': 'PropTypes',
              };

    return {
        mode,
        entry,
        output: {
            path: path.resolve(__dirname, dashLibraryName),
            chunkFilename: '[name].js',
            filename,
            library: dashLibraryName,
            libraryTarget: 'window',
        },
        devtool,
        devServer: {
            static: {
                directory: path.join(__dirname, '/'),
            },
        },
        externals,
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
        },
        module: {
            rules: [
                {
                    // library source is TypeScript: ts-loader type-checks against Mantine's real .d.ts
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                    },
                },
                {
                    // the demo app (src/demo) is still plain JS/JSX
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',
                        },
                    ],
                },
            ],
        },
        optimization: {
            splitChunks: {
                name: '[name].js',
                cacheGroups: {
                    async: {
                        chunks: 'async',
                        minSize: 0,
                        name(module, chunks, cacheGroupKey) {
                            return `${cacheGroupKey}-${chunks[0].name}`;
                        },
                    },
                    shared: {
                        chunks: 'all',
                        minSize: 0,
                        minChunks: 2,
                        name: 'dash_week_range_picker-shared',
                    },
                },
            },
        },
        plugins: [
            new WebpackDashDynamicImport(),
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map',
                exclude: ['async-plotlyjs'],
            }),
        ],
    };
};
