import React, {useRef} from 'react';
import {
    Box,
    MantineProvider,
    MantineThemeOverride,
    UnstyledButton,
} from '@mantine/core';
import {
    Calendar,
    CalendarLevel,
    DateStringValue,
    PickerInputBase,
} from '@mantine/dates';
import {useDisclosure} from '@mantine/hooks';
import {DashBaseProps} from '../props';
import {useWeekRangeState} from '../useWeekRangeState';
import './WeekRangePickerInput.css';

// Mantine's own type for the prop. Kept as a local alias used only at the JSX boundary - the public
// `firstDayOfWeek` prop below stays a plain `number`, because Dash's extract-meta shape-enumerates
// anything richer and chokes on it.
type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface Props extends DashBaseProps {
    /**
     * `[startISO, endISO]`, both ISO `YYYY-MM-DD` and already week-aligned (Monday/Sunday), e.g.
     * `["2026-06-01", "2026-06-07"]`. `[startISO, null]` while a range is mid-selection (one week
     * picked so far, `mode="range"` only). `[null, null]` (or unset) when empty.
     *
     * The shape is the same in both modes - a single-week selection is just a range whose two borders
     * belong to the same week - so switching `mode` never changes what a callback receives.
     */
    value?: string[];

    /**
     * Selection mode. `"range"` (default) takes two clicks, one per border of the range; `"single"`
     * commits the whole ISO week under the cursor on the first click, and every later click replaces
     * it outright.
     *
     * This constrains only how clicks *build* a value, not what `value` is allowed to hold: nothing is
     * ever auto-corrected. A `value` (or a `presets` entry) spanning more than one week renders as the
     * range it honestly is under `mode="single"`, and reaches your callbacks unchanged - the next click
     * simply replaces it with a single week.
     */
    mode?: 'single' | 'range';

    /**
     * Earliest selectable date, ISO `YYYY-MM-DD`. Does not need to be week-aligned itself; days before
     * it are disabled in the calendar the normal Mantine way.
     */
    minDate?: string;

    /**
     * Latest selectable date, ISO `YYYY-MM-DD`.
     */
    maxDate?: string;

    /**
     * Quick-pick shortcuts shown to the left of the calendar, each `value` already a week-aligned
     * `[startISO, endISO]` pair, e.g. `{"label": "Last 12 Weeks", "value": ["2026-03-16", "2026-06-07"]}`.
     *
     * Preset values are passed through to `value` verbatim, in both modes - a multi-week preset under
     * `mode="single"` selects those weeks rather than being narrowed to one or rejected, on the same
     * "the value is whatever you configured" principle as `value` itself.
     */
    presets?: Array<{
        label?: string;
        value?: string[];
    }>;

    /**
     * Text shown in the input when nothing is selected.
     */
    placeholder?: string;

    /**
     * Shows a clear button (resets value to `[null, null]`) once something is selected.
     */
    clearable?: boolean;

    /**
     * Closes the calendar popover as soon as the selection is complete (with `mode="single"` that is
     * the first click, with `mode="range"` the second one), or a preset is clicked.
     */
    closeOnChange?: boolean;

    /**
     * Shows the ISO week-number column next to the calendar grid.
     */
    withWeekNumbers?: boolean;

    /**
     * Highlights today's date in the calendar.
     */
    highlightToday?: boolean;

    /**
     * 0-6, where 1 = Monday. Do not change this - the click-to-select-week snapping logic always
     * snaps to the Monday/Sunday of the ISO week regardless of this prop, so changing it would only
     * desync the visual grid from that logic, not the weeks it actually selects.
     */
    firstDayOfWeek?: number;

    /**
     * Mantine theme override, merged into this component's own isolated `MantineProvider` (this
     * component ships its own private copy of `@mantine/core`, so it does not automatically inherit a
     * host app's `MantineProvider` theme - pass the same theme dict the host app uses here instead).
     */
    theme?: object;

    /**
     * Forces a specific color scheme ("light" | "dark") on this component's own `MantineProvider`,
     * independent of the host app's own scheme.
     */
    forceColorScheme?: 'light' | 'dark';

    /**
     * CSS class for the outer wrapper div.
     */
    className?: string;

    /**
     * Inline style for the outer wrapper div.
     */
    style?: object;

    /**
     * Used to allow user interactions in this component to be persisted when the component - or the
     * page - is refreshed. If `persisted` is truthy and `persistence_type` is `session`, the value is
     * persisted for the duration of the browser session.
     */
    persistence?: boolean | string | number;

    /**
     * Properties whose user interactions will persist after refreshing the component or the page.
     */
    persisted_props?: string[];

    /**
     * Where persisted user changes will be stored: `memory` (only kept in memory, reset on page
     * refresh), `local` (window.localStorage, data is kept after the browser quit), or `session`
     * (window.sessionStorage, data is cleared once the browser quit).
     */
    persistence_type?: 'local' | 'session' | 'memory';
}

/**
 * WeekRangePickerInput - an ISO-week-granularity range picker (Mantine `Calendar` + `PickerInputBase`
 * composed by hand, the same public building blocks Mantine's own `YearPickerInput`/`MonthPickerInput`
 * are built from). Clicking any day selects/commits its whole ISO week (Monday-Sunday), instead of the
 * arbitrary single day a normal date-range picker would give you.

 * `value` is always `[startISO, endISO]` where both bounds already fall on a Monday/Sunday
 * respectively, or `[startISO, null]` while a range is mid-selection (exactly one week picked so far),
 * or `[null, null]` when empty - the same shape a Dash range DatePickerInput already emits, so it drops
 * into any callback written against `utils.dates.unpack_range`/`range_pending` unchanged.

 * `mode="single"` narrows the interaction to one week per click; the emitted value keeps the exact same
 * `[startISO, endISO]` shape (a single week is just a range whose borders share a week), so `mode` can
 * be switched without touching a single callback.
 */
const WeekRangePickerInput = ({
    id,
    value,
    mode = 'range',
    minDate,
    maxDate,
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
    // read by Dash's persistence engine straight off the schema, not in the component body; kept in
    // the destructuring only so their defaults land in the generated metadata
    persistence = false, // eslint-disable-line @typescript-eslint/no-unused-vars
    persisted_props = ['value'], // eslint-disable-line @typescript-eslint/no-unused-vars
    persistence_type = 'local', // eslint-disable-line @typescript-eslint/no-unused-vars
}: Props) => {
    const [dropdownOpened, dropdownHandlers] = useDisclosure(false);

    const handleChange = (
        newValue: [DateStringValue | null, DateStringValue | null]
    ) => {
        if (setProps) {
            setProps({value: newValue});
        }
        // mirrors Mantine's own useDatesInput: close only once both bounds of the range are set, not
        // on the first (mid-selection) click - PickerInputBase itself doesn't know about closeOnChange
        // (it's not one of its own props, just forwarded rest-props if passed to it, which React then
        // warns about since they'd land on the underlying DOM button), so this component owns the timing.
        // Needs no mode branch: a single-mode click emits both bounds at once, so "both bounds set" is
        // already "the selection is complete" in either mode.
        if (closeOnChange && newValue[0] && newValue[1]) {
            dropdownHandlers.close();
        }
    };

    const {
        value: _value,
        getDayProps,
        onRootMouseLeave,
    } = useWeekRangeState(value, handleChange, mode);
    const [start, end] = _value;

    const formattedValue =
        start && end ? `${start} – ${end}` : start ? `${start} – ` : null;
    const shouldClear = Boolean(clearable && (start || end));

    // Calendar exposes __setDateRef/__setLevelRef (via useImperativeHandle) specifically so a wrapping
    // component can jump its displayed month imperatively - this is exactly how Mantine's own DatePicker
    // implements "clicking a preset navigates the view to it", not something Calendar does on its own
    const dateRef = useRef<((date: DateStringValue) => void) | null>(null);
    const levelRef = useRef<((level: CalendarLevel) => void) | null>(null);

    const handlePresetClick = (presetValue?: string[]) => {
        handleChange(
            (presetValue ?? [null, null]) as [
                DateStringValue | null,
                DateStringValue | null,
            ]
        );
        const jumpTo = Array.isArray(presetValue)
            ? presetValue[0]
            : presetValue;
        if (jumpTo) {
            dateRef.current?.(jumpTo);
            levelRef.current?.('month');
        }
        if (closeOnChange) {
            dropdownHandlers.close();
        }
    };

    const hasPresets = presets && presets.length > 0;
    const calendar = (
        <Calendar
            __setDateRef={dateRef}
            __setLevelRef={levelRef}
            firstDayOfWeek={firstDayOfWeek as FirstDayOfWeek}
            withWeekNumbers={withWeekNumbers}
            highlightToday={highlightToday}
            minDate={minDate || undefined}
            maxDate={maxDate || undefined}
            defaultDate={start || undefined}
            getDayProps={getDayProps}
            onMouseLeave={onRootMouseLeave}
        />
    );

    return (
        <MantineProvider
            theme={theme as MantineThemeOverride}
            forceColorScheme={forceColorScheme}
        >
            <div
                id={id as string}
                className={className}
                style={style as React.CSSProperties}
                data-dash-is-loading={
                    (loading_state && loading_state.is_loading) || undefined
                }
            >
                <PickerInputBase
                    // Mantine's own vocabulary for "one value", not ours - PickerInputBase uses `type`
                    // only to decide whether a half-set value ([start, null]) counts as an invalid
                    // range and should get error styling, which single mode must never show since it
                    // can't produce that state itself. Kept as an internal detail: our public `mode`
                    // deliberately drops Mantine's "default"/"multiple" names.
                    type={mode === 'single' ? 'default' : 'range'}
                    value={_value}
                    formattedValue={formattedValue}
                    dropdownOpened={dropdownOpened}
                    dropdownHandlers={dropdownHandlers}
                    onClear={() => handleChange([null, null])}
                    shouldClear={shouldClear}
                    clearable={clearable}
                    placeholder={placeholder}
                >
                    {hasPresets ? (
                        <Box className="wrp-presets-root">
                            <div className="wrp-presets-list">
                                {presets.map((preset) => (
                                    <UnstyledButton
                                        key={preset.label}
                                        className="wrp-preset-button"
                                        onClick={() =>
                                            handlePresetClick(preset.value)
                                        }
                                    >
                                        {preset.label}
                                    </UnstyledButton>
                                ))}
                            </div>
                            {calendar}
                        </Box>
                    ) : (
                        calendar
                    )}
                </PickerInputBase>
            </div>
        </MantineProvider>
    );
};

export default WeekRangePickerInput;
