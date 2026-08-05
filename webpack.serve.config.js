// Config for `npm start` / `make serve`: the live-reload playground, which builds the demo app
// (src/demo) instead of the publishable library. Takes the real build config and overrides only
// what differs - see the `overrides` note in webpack.config.js for how that hand-off works.
const config = require('./webpack.config.js');
const path = require('path');

config.entry = {main: './src/demo/index.js'};
config.output = {
    filename: './output.js',
    path: path.resolve(__dirname),
};
config.mode = 'development';
// The library build leaves React et al. external, because a Dash page already provides them as
// globals. The playground is a bare index.html with no such host, so everything must be bundled.
config.externals = undefined; // eslint-disable-line
config.devtool = 'inline-source-map';
module.exports = config;
