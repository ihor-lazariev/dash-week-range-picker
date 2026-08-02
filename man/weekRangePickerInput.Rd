% Auto-generated: do not edit by hand
\name{weekRangePickerInput}

\alias{weekRangePickerInput}

\title{WeekRangePickerInput component}

\description{
WeekRangePickerInput - an ISO-week-granularity range picker (Mantine `Calendar` + `PickerInputBase` composed by hand, the same public building blocks Mantine's own `YearPickerInput`/`MonthPickerInput` are built from). Clicking any day selects/commits its whole ISO week (Monday-Sunday), instead of the arbitrary single day a normal date-range picker would give you.  `value` is always `[startISO, endISO]` where both bounds already fall on a Monday/Sunday respectively, or `[startISO, null]` while a range is mid-selection (exactly one week picked so far), or `[null, null]` when empty - the same shape a Dash range DatePickerInput already emits, so it drops into any callback written against `utils.dates.unpack_range`/`range_pending` unchanged.
}

\usage{
weekRangePickerInput(id=NULL, className=NULL, clearable=NULL, closeOnChange=NULL,
firstDayOfWeek=NULL, forceColorScheme=NULL,
highlightToday=NULL, loading_state=NULL, maxDate=NULL,
minDate=NULL, persisted_props=NULL, persistence=NULL,
persistence_type=NULL, placeholder=NULL, presets=NULL,
style=NULL, theme=NULL, value=NULL, withWeekNumbers=NULL)
}

\arguments{
\item{id}{Character | named list. The ID used to identify this component in Dash callbacks. Works as a normal Dash id, including
pattern-matching (dict) ids.}

\item{className}{Character. CSS class for the outer wrapper div.}

\item{clearable}{Logical. Shows a clear button (resets value to `[null, null]`) once a range is selected.}

\item{closeOnChange}{Logical. Closes the calendar popover as soon as a range is completed (or a preset is clicked).}

\item{firstDayOfWeek}{Numeric. 0-6, where 1 = Monday. Do not change this - the click-to-select-week snapping logic always
snaps to the Monday/Sunday of the ISO week regardless of this prop, so changing it would only
desync the visual grid from that logic, not the weeks it actually selects.}

\item{forceColorScheme}{A value equal to: 'light', 'dark'. Forces a specific color scheme ("light" | "dark") on this component's own `MantineProvider`,
independent of the host app's own scheme.}

\item{highlightToday}{Logical. Highlights today's date in the calendar.}

\item{loading_state}{Lists containing elements 'is_loading', 'prop_name', 'component_name'.
those elements have the following types:
  - is_loading (logical; optional): determines if the component is loading or not.
  - prop_name (character; optional): holds which property is loading.
  - component_name (character; optional): holds the name of the component that is loading.. Object that holds the loading state object coming from dash-renderer.}

\item{maxDate}{Character. Latest selectable date, ISO `YYYY-MM-DD`.}

\item{minDate}{Character. Earliest selectable date, ISO `YYYY-MM-DD`. Does not need to be week-aligned itself; days before
it are disabled in the calendar the normal Mantine way.}

\item{persisted_props}{List of a value equal to: 'value's. Properties whose user interactions will persist after refreshing the component or the page.}

\item{persistence}{Logical | character | numeric. Used to allow user interactions in this component to be persisted when the component - or the
page - is refreshed. If `persisted` is truthy and `persistence_type` is `session`, the value is
persisted for the duration of the browser session.}

\item{persistence_type}{A value equal to: 'local', 'session', 'memory'. Where persisted user changes will be stored: `memory` (only kept in memory, reset on page
refresh), `local` (window.localStorage, data is kept after the browser quit), or `session`
(window.sessionStorage, data is cleared once the browser quit).}

\item{placeholder}{Character. Text shown in the input when no range is selected.}

\item{presets}{List of lists containing elements 'label', 'value'.
those elements have the following types:
  - label (character; optional)
  - value (list of characters; optional)s. Quick-pick shortcuts shown to the left of the calendar, each `value` already a week-aligned
`[startISO, endISO]` pair, e.g. `{"label": "Last 12 Weeks", "value": ["2026-03-16", "2026-06-07"]}`.}

\item{style}{Named list. Inline style for the outer wrapper div.}

\item{theme}{Named list. Mantine theme override, merged into this component's own isolated `MantineProvider` (this
component ships its own private copy of `@mantine/core`, so it does not automatically inherit a
host app's `MantineProvider` theme - pass the same theme dict the host app uses here instead).}

\item{value}{List of characters. `[startISO, endISO]`, both ISO `YYYY-MM-DD` and already week-aligned (Monday/Sunday), e.g.
`["2026-06-01", "2026-06-07"]`. `[startISO, null]` while a range is mid-selection (one week
picked so far). `[null, null]` (or unset) when empty.}

\item{withWeekNumbers}{Logical. Shows the ISO week-number column next to the calendar grid.}
}

\value{named list of JSON elements corresponding to React.js properties and their values}

