/* eslint-disable import/prefer-default-export */
// deliberately NOT importing @mantine/core/styles.css + @mantine/dates/styles.css here: any real host
// of this component already has dash-mantine-components (or another @mantine/core@8.x consumer) loaded,
// which injects that identical stylesheet - shipping a second copy in our own bundle doesn't just waste
// bytes, it actively breaks host-side CSS overrides, since our copy loads later (at runtime, when this
// chunk first executes) and wins the cascade against anything the host customized on top of the shared
// defaults. The demo app (src/demo) imports these directly since it has no such host to rely on.
import WeekRangePickerInput from './components/WeekRangePickerInput.react';

export {
    WeekRangePickerInput
};
