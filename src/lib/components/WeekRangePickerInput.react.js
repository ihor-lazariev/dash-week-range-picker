import React from 'react';
import PropTypes from 'prop-types';
import { MantineProvider, Group, Stack, Button } from '@mantine/core';
import { PickerInputBase, Calendar } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useWeekRangeState } from '../useWeekRangeState';

/**
 * WeekRangePickerInput - an ISO-week-granularity range picker (Mantine `Calendar` + `PickerInputBase`
 * composed by hand, the same public building blocks Mantine's own `YearPickerInput`/`MonthPickerInput`
 * are built from). Clicking any day selects/commits its whole ISO week (Monday-Sunday), instead of the
 * arbitrary single day a normal date-range picker would give you.
 *
 * `value` is always `[startISO, endISO]` where both bounds already fall on a Monday/Sunday
 * respectively, or `[startISO, null]` while a range is mid-selection (exactly one week picked so far),
 * or `[null, null]` when empty - the same shape a Dash range DatePickerInput already emits, so it drops
 * into any callback written against `utils.dates.unpack_range`/`range_pending` unchanged.
 */
const WeekRangePickerInput = ({
    id,
    value = [null, null],
    minDate = null,
    maxDate = null,
    presets = [],
    placeholder = 'Select Period',
    clearable = true,
    closeOnChange = false,
    withWeekNumbers = true,
    highlightToday = true,
    firstDayOfWeek = 1,
    theme = {},
    forceColorScheme,
    className,
    style,
    loading_state,
    setProps,
    // not read in the component body - Dash's persistence engine reads these straight off
    // propTypes/defaults, declared here (rather than a separate defaultProps block) only to avoid
    // React 18's "defaultProps on function components is deprecated" warning
    persistence = false, // eslint-disable-line no-unused-vars
    persisted_props = ['value'], // eslint-disable-line no-unused-vars
    persistence_type = 'local', // eslint-disable-line no-unused-vars
}) => {
    const [dropdownOpened, dropdownHandlers] = useDisclosure(false);

    const handleChange = (newValue) => {
        if (setProps) {
            setProps({ value: newValue });
        }
        // mirrors Mantine's own useDatesInput: close only once both bounds of the range are set, not
        // on the first (mid-selection) click - PickerInputBase itself doesn't know about closeOnChange
        // (it's not one of its own props, just forwarded rest-props if passed to it, which React then
        // warns about since they'd land on the underlying DOM button), so this component owns the timing
        if (closeOnChange && newValue[0] && newValue[1]) {
            dropdownHandlers.close();
        }
    };

    const { value: _value, getDayProps, onRootMouseLeave } = useWeekRangeState(value, handleChange);
    const [start, end] = _value;

    const formattedValue = start && end ? `${start} – ${end}` : start ? `${start} – ` : null;
    const shouldClear = Boolean(clearable && (start || end));

    const handlePresetClick = (presetValue) => {
        handleChange(presetValue);
        if (closeOnChange) {
            dropdownHandlers.close();
        }
    };

    return (
        <MantineProvider theme={theme} forceColorScheme={forceColorScheme}>
            <div
                id={id}
                className={className}
                style={style}
                data-dash-is-loading={(loading_state && loading_state.is_loading) || undefined}
            >
                <PickerInputBase
                    type="range"
                    value={_value}
                    formattedValue={formattedValue}
                    dropdownOpened={dropdownOpened}
                    dropdownHandlers={dropdownHandlers}
                    onClear={() => handleChange([null, null])}
                    shouldClear={shouldClear}
                    clearable={clearable}
                    placeholder={placeholder}
                >
                    <Group align="flex-start" wrap="nowrap" gap={0}>
                        {presets && presets.length > 0 && (
                            <Stack gap={2} p="xs" style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}>
                                {presets.map((preset) => (
                                    <Button
                                        key={preset.label}
                                        variant="subtle"
                                        size="xs"
                                        onClick={() => handlePresetClick(preset.value)}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </Stack>
                        )}
                        <Calendar
                            firstDayOfWeek={firstDayOfWeek}
                            withWeekNumbers={withWeekNumbers}
                            highlightToday={highlightToday}
                            minDate={minDate || undefined}
                            maxDate={maxDate || undefined}
                            defaultDate={start || undefined}
                            getDayProps={getDayProps}
                            onMouseLeave={onRootMouseLeave}
                        />
                    </Group>
                </PickerInputBase>
            </div>
        </MantineProvider>
    );
};

WeekRangePickerInput.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks. Works as a normal Dash id, including
     * pattern-matching (dict) ids.
     */
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

    /**
     * `[startISO, endISO]`, both ISO `YYYY-MM-DD` and already week-aligned (Monday/Sunday), e.g.
     * `["2026-06-01", "2026-06-07"]`. `[startISO, null]` while a range is mid-selection (one week
     * picked so far). `[null, null]` (or unset) when empty.
     */
    value: PropTypes.arrayOf(PropTypes.string),

    /**
     * Earliest selectable date, ISO `YYYY-MM-DD`. Does not need to be week-aligned itself; days before
     * it are disabled in the calendar the normal Mantine way.
     */
    minDate: PropTypes.string,

    /**
     * Latest selectable date, ISO `YYYY-MM-DD`.
     */
    maxDate: PropTypes.string,

    /**
     * Quick-pick shortcuts shown to the left of the calendar, each `value` already a week-aligned
     * `[startISO, endISO]` pair, e.g. `{"label": "Last 12 Weeks", "value": ["2026-03-16", "2026-06-07"]}`.
     */
    presets: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.arrayOf(PropTypes.string),
        })
    ),

    /**
     * Text shown in the input when no range is selected.
     */
    placeholder: PropTypes.string,

    /**
     * Shows a clear button (resets value to `[null, null]`) once a range is selected.
     */
    clearable: PropTypes.bool,

    /**
     * Closes the calendar popover as soon as a range is completed (or a preset is clicked).
     */
    closeOnChange: PropTypes.bool,

    /**
     * Shows the ISO week-number column next to the calendar grid.
     */
    withWeekNumbers: PropTypes.bool,

    /**
     * Highlights today's date in the calendar.
     */
    highlightToday: PropTypes.bool,

    /**
     * 0-6, where 1 = Monday. Do not change this - the click-to-select-week snapping logic always
     * snaps to the Monday/Sunday of the ISO week regardless of this prop, so changing it would only
     * desync the visual grid from that logic, not the weeks it actually selects.
     */
    firstDayOfWeek: PropTypes.number,

    /**
     * Mantine theme override, merged into this component's own isolated `MantineProvider` (this
     * component ships its own private copy of `@mantine/core`, so it does not automatically inherit a
     * host app's `MantineProvider` theme - pass the same theme dict the host app uses here instead).
     */
    theme: PropTypes.object,

    /**
     * Forces a specific color scheme ("light" | "dark") on this component's own `MantineProvider`,
     * independent of the host app's own scheme.
     */
    forceColorScheme: PropTypes.oneOf(['light', 'dark']),

    /**
     * CSS class for the outer wrapper div.
     */
    className: PropTypes.string,

    /**
     * Inline style for the outer wrapper div.
     */
    style: PropTypes.object,

    /**
     * Object that holds the loading state object coming from dash-renderer.
     */
    loading_state: PropTypes.shape({
        /**
         * Determines if the component is loading or not.
         */
        is_loading: PropTypes.bool,
        /**
         * Holds which property is loading.
         */
        prop_name: PropTypes.string,
        /**
         * Holds the name of the component that is loading.
         */
        component_name: PropTypes.string,
    }),

    /**
     * Dash-assigned callback that should be called to report property changes to Dash, to make them
     * available for callbacks. Also supports `persistence` the normal Dash way.
     */
    setProps: PropTypes.func,

    /**
     * Used to allow user interactions in this component to be persisted when the component - or the
     * page - is refreshed. If `persisted` is truthy and `persistence_type` is `session`, the value is
     * persisted for the duration of the browser session.
     */
    persistence: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.number]),

    /**
     * Properties whose user interactions will persist after refreshing the component or the page.
     */
    persisted_props: PropTypes.arrayOf(PropTypes.oneOf(['value'])),

    /**
     * Where persisted user changes will be stored: `memory` (only kept in memory, reset on page
     * refresh), `local` (window.localStorage, data is kept after the browser quit), or `session`
     * (window.sessionStorage, data is cleared once the browser quit).
     */
    persistence_type: PropTypes.oneOf(['local', 'session', 'memory']),
};

export default WeekRangePickerInput;
