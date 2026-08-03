import React from 'react';
import ReactDOM from 'react-dom';
// the real package (src/lib/index.ts) deliberately doesn't import these - it expects a host page that
// already loads Mantine's base styles (e.g. via dash-mantine-components). This standalone demo has no
// such host, so it supplies them itself.
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
