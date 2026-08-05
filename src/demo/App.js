/* eslint no-magic-numbers: 0 */
// The webpack playground (`npm start` / `make serve`): both modes side by side, with no Dash and no
// Python involved, so a change to src/lib can be eyeballed on save. usage.py is the Dash equivalent.
import React, {useState} from 'react';
import dayjs from 'dayjs';

import {WeekRangePickerInput} from '../lib';
import {isoWeekEnd, isoWeekStart} from '../lib/dateUtils';

const iso = (d) => d.format('YYYY-MM-DD');

// [Monday, Sunday] of the week `offsetWeeks` away from the current one
const weekOf = (offsetWeeks) => {
    const day = iso(dayjs().add(offsetWeeks, 'week'));
    return [isoWeekStart(day), isoWeekEnd(day)];
};

// the last `n` complete weeks, i.e. ending last Sunday - counting back in whole weeks and only then
// taking the borders, never day-precise math that gets snapped afterwards
const lastNWeeks = (n) => [
    isoWeekStart(iso(dayjs().subtract(n, 'week'))),
    isoWeekEnd(iso(dayjs().subtract(1, 'week'))),
];

const PRESETS = [
    {label: 'Last 4 Weeks', value: lastNWeeks(4)},
    {label: 'Last 12 Weeks', value: lastNWeeks(12)},
];

// single mode still takes [start, end] pairs - these are just one week wide. The last one deliberately
// is not: preset values pass through verbatim in both modes, so it selects all 3 weeks (and the next
// calendar click replaces it with a single one) - here to eyeball that documented behaviour.
const SINGLE_PRESETS = [
    {label: 'Last Week', value: weekOf(-1)},
    {label: 'Week Before', value: weekOf(-2)},
    {label: '3 Weeks (wide, passes through)', value: lastNWeeks(3)},
];

const MIN_DATE = weekOf(-52)[0];
// end of the current week
const MAX_DATE = weekOf(0)[1];

const App = () => {
    const [rangeValue, setRangeValue] = useState([null, null]);
    const [singleValue, setSingleValue] = useState([null, null]);

    return (
        <div style={{padding: 40, display: 'flex', gap: 40}}>
            <div>
                <p>mode=&quot;range&quot;: {JSON.stringify(rangeValue)}</p>
                <WeekRangePickerInput
                    id="demo-picker-range"
                    value={rangeValue}
                    setProps={(newProps) => setRangeValue(newProps.value)}
                    minDate={MIN_DATE}
                    maxDate={MAX_DATE}
                    presets={PRESETS}
                />
            </div>
            <div>
                <p>mode=&quot;single&quot;: {JSON.stringify(singleValue)}</p>
                <WeekRangePickerInput
                    id="demo-picker-single"
                    mode="single"
                    value={singleValue}
                    setProps={(newProps) => setSingleValue(newProps.value)}
                    minDate={MIN_DATE}
                    maxDate={MAX_DATE}
                    presets={SINGLE_PRESETS}
                    placeholder="Select Week"
                />
            </div>
        </div>
    );
};

export default App;
