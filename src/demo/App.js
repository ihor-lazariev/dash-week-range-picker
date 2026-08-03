/* eslint no-magic-numbers: 0 */
import React, {useState} from 'react';

import {WeekRangePickerInput} from '../lib';

const PRESETS = [
    {label: 'Last 4 Weeks', value: ['2025-12-08', '2026-01-04']},
    {label: 'Last 12 Weeks', value: ['2025-10-13', '2026-01-04']},
];

const App = () => {
    const [value, setValue] = useState([null, null]);

    return (
        <div style={{padding: 40}}>
            <p>value: {JSON.stringify(value)}</p>
            <WeekRangePickerInput
                id="demo-picker"
                value={value}
                setProps={(newProps) => setValue(newProps.value)}
                minDate="2025-01-06"
                maxDate="2026-01-04"
                presets={PRESETS}
            />
        </div>
    );
};

export default App;
