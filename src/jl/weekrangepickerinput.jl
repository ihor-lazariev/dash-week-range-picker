# AUTO GENERATED FILE - DO NOT EDIT

export weekrangepickerinput

"""
    weekrangepickerinput(;kwargs...)

A WeekRangePickerInput component.
WeekRangePickerInput - an ISO-week-granularity range picker (Mantine `Calendar` + `PickerInputBase`
composed by hand, the same public building blocks Mantine's own `YearPickerInput`/`MonthPickerInput`
are built from). Clicking any day selects/commits its whole ISO week (Monday-Sunday), instead of the
arbitrary single day a normal date-range picker would give you.

`value` is always `[startISO, endISO]` where both bounds already fall on a Monday/Sunday
respectively, or `[startISO, null]` while a range is mid-selection (exactly one week picked so far),
or `[null, null]` when empty - the same shape a Dash range DatePickerInput already emits, so it drops
into any callback written against `utils.dates.unpack_range`/`range_pending` unchanged.
Keyword arguments:
- `id` (String | Dict; optional): The ID used to identify this component in Dash callbacks. Works as a normal Dash id, including
pattern-matching (dict) ids.
- `className` (String; optional): CSS class for the outer wrapper div.
- `clearable` (Bool; optional): Shows a clear button (resets value to `[null, null]`) once a range is selected.
- `closeOnChange` (Bool; optional): Closes the calendar popover as soon as a range is completed (or a preset is clicked).
- `firstDayOfWeek` (Real; optional): 0-6, where 1 = Monday. Do not change this - the click-to-select-week snapping logic always
snaps to the Monday/Sunday of the ISO week regardless of this prop, so changing it would only
desync the visual grid from that logic, not the weeks it actually selects.
- `forceColorScheme` (a value equal to: 'light', 'dark'; optional): Forces a specific color scheme ("light" | "dark") on this component's own `MantineProvider`,
independent of the host app's own scheme.
- `highlightToday` (Bool; optional): Highlights today's date in the calendar.
- `loading_state` (optional): Object that holds the loading state object coming from dash-renderer.. loading_state has the following type: lists containing elements 'is_loading', 'prop_name', 'component_name'.
Those elements have the following types:
  - `is_loading` (Bool; optional): Determines if the component is loading or not.
  - `prop_name` (String; optional): Holds which property is loading.
  - `component_name` (String; optional): Holds the name of the component that is loading.
- `maxDate` (String; optional): Latest selectable date, ISO `YYYY-MM-DD`.
- `minDate` (String; optional): Earliest selectable date, ISO `YYYY-MM-DD`. Does not need to be week-aligned itself; days before
it are disabled in the calendar the normal Mantine way.
- `persisted_props` (Array of a value equal to: 'value's; optional): Properties whose user interactions will persist after refreshing the component or the page.
- `persistence` (Bool | String | Real; optional): Used to allow user interactions in this component to be persisted when the component - or the
page - is refreshed. If `persisted` is truthy and `persistence_type` is `session`, the value is
persisted for the duration of the browser session.
- `persistence_type` (a value equal to: 'local', 'session', 'memory'; optional): Where persisted user changes will be stored: `memory` (only kept in memory, reset on page
refresh), `local` (window.localStorage, data is kept after the browser quit), or `session`
(window.sessionStorage, data is cleared once the browser quit).
- `placeholder` (String; optional): Text shown in the input when no range is selected.
- `presets` (optional): Quick-pick shortcuts shown to the left of the calendar, each `value` already a week-aligned
`[startISO, endISO]` pair, e.g. `{"label": "Last 12 Weeks", "value": ["2026-03-16", "2026-06-07"]}`.. presets has the following type: Array of lists containing elements 'label', 'value'.
Those elements have the following types:
  - `label` (String; optional)
  - `value` (Array of Strings; optional)s
- `style` (Dict; optional): Inline style for the outer wrapper div.
- `theme` (Dict; optional): Mantine theme override, merged into this component's own isolated `MantineProvider` (this
component ships its own private copy of `@mantine/core`, so it does not automatically inherit a
host app's `MantineProvider` theme - pass the same theme dict the host app uses here instead).
- `value` (Array of Strings; optional): `[startISO, endISO]`, both ISO `YYYY-MM-DD` and already week-aligned (Monday/Sunday), e.g.
`["2026-06-01", "2026-06-07"]`. `[startISO, null]` while a range is mid-selection (one week
picked so far). `[null, null]` (or unset) when empty.
- `withWeekNumbers` (Bool; optional): Shows the ISO week-number column next to the calendar grid.
"""
function weekrangepickerinput(; kwargs...)
        available_props = Symbol[:id, :className, :clearable, :closeOnChange, :firstDayOfWeek, :forceColorScheme, :highlightToday, :loading_state, :maxDate, :minDate, :persisted_props, :persistence, :persistence_type, :placeholder, :presets, :style, :theme, :value, :withWeekNumbers]
        wild_props = Symbol[]
        return Component("weekrangepickerinput", "WeekRangePickerInput", "dash_week_range_picker", available_props, wild_props; kwargs...)
end

