# AUTO GENERATED FILE - DO NOT EDIT

import typing  # noqa: F401
from typing_extensions import TypedDict, NotRequired, Literal # noqa: F401
from dash.development.base_component import Component, _explicitize_args
try:
    from dash.types import NumberType  # noqa: F401
except ImportError:
    # Backwards compatibility for dash<=4.1.0
    if typing.TYPE_CHECKING:
        raise
    NumberType = typing.Union[  # noqa: F401
        typing.SupportsFloat, typing.SupportsInt, typing.SupportsComplex
    ]

ComponentSingleType = typing.Union[str, int, float, Component, None]
ComponentType = typing.Union[
    ComponentSingleType,
    typing.Sequence[ComponentSingleType],
]


class WeekRangePickerInput(Component):
    """A WeekRangePickerInput component.
WeekRangePickerInput - an ISO-week-granularity range picker (Mantine `Calendar` + `PickerInputBase`
composed by hand, the same public building blocks Mantine's own `YearPickerInput`/`MonthPickerInput`
are built from). Clicking any day selects/commits its whole ISO week (Monday-Sunday), instead of the
arbitrary single day a normal date-range picker would give you.
`value` is always `[startISO, endISO]` where both bounds already fall on a Monday/Sunday
respectively, or `[startISO, null]` while a range is mid-selection (exactly one week picked so far),
or `[null, null]` when empty - the same shape a Dash range DatePickerInput already emits, so it drops
into any callback written against `utils.dates.unpack_range`/`range_pending` unchanged.
`mode="single"` narrows the interaction to one week per click; the emitted value keeps the exact same
`[startISO, endISO]` shape (a single week is just a range whose borders share a week), so `mode` can
be switched without touching a single callback.

Keyword arguments:

- id (string | dict; optional):
    The ID used to identify this component in Dash callbacks. Works as
    a normal Dash id, including pattern-matching (dict) ids.

- className (string; optional):
    CSS class for the outer wrapper div.

- clearable (boolean; default True):
    Shows a clear button (resets value to `[None, None]`) once
    something is selected.

- closeOnChange (boolean; default False):
    Closes the calendar popover as soon as the selection is complete
    (with `mode=\"single\"` that is the first click, with
    `mode=\"range\"` the second one), or a preset is clicked.

- firstDayOfWeek (number; default 1):
    0-6, where 1 = Monday. Do not change this - the
    click-to-select-week snapping logic always snaps to the
    Monday/Sunday of the ISO week regardless of this prop, so changing
    it would only desync the visual grid from that logic, not the
    weeks it actually selects.

- forceColorScheme (a value equal to: 'light', 'dark'; optional):
    Forces a specific color scheme (\"light\" | \"dark\") on this
    component's own `MantineProvider`, independent of the host app's
    own scheme.

- highlightToday (boolean; default True):
    Highlights today's date in the calendar.

- loading_state (dict; optional):
    Object that holds the loading state object coming from
    dash-renderer.

    `loading_state` is a dict with keys:

    - is_loading (boolean; optional):
        Determines if the component is loading or not.

    - prop_name (string; optional):
        Holds which property is loading.

    - component_name (string; optional):
        Holds the name of the component that is loading.

- maxDate (string; optional):
    Latest selectable date, ISO `YYYY-MM-DD`.

- minDate (string; optional):
    Earliest selectable date, ISO `YYYY-MM-DD`. Does not need to be
    week-aligned itself; days before it are disabled in the calendar
    the normal Mantine way.

- mode (a value equal to: 'single', 'range'; default 'range'):
    Selection mode. `\"range\"` (default) takes two clicks, one per
    border of the range; `\"single\"` commits the whole ISO week under
    the cursor on the first click, and every later click replaces it
    outright.  This constrains only how clicks *build* a value, not
    what `value` is allowed to hold: nothing is ever auto-corrected. A
    `value` (or a `presets` entry) spanning more than one week renders
    as the range it honestly is under `mode=\"single\"`, and reaches
    your callbacks unchanged - the next click simply replaces it with
    a single week.

- persisted_props (list of strings; default ['value']):
    Properties whose user interactions will persist after refreshing
    the component or the page.

- persistence (string | number | boolean; default False):
    Used to allow user interactions in this component to be persisted
    when the component - or the page - is refreshed. If `persisted` is
    truthy and `persistence_type` is `session`, the value is persisted
    for the duration of the browser session.

- persistence_type (a value equal to: 'local', 'session', 'memory'; default 'local'):
    Where persisted user changes will be stored: `memory` (only kept
    in memory, reset on page refresh), `local` (window.localStorage,
    data is kept after the browser quit), or `session`
    (window.sessionStorage, data is cleared once the browser quit).

- placeholder (string; default 'Select Period'):
    Text shown in the input when nothing is selected.

- presets (list of dicts; optional):
    Quick-pick shortcuts shown to the left of the calendar, each
    `value` already a week-aligned `[startISO, endISO]` pair, e.g.
    `{\"label\": \"Last 12 Weeks\", \"value\": [\"2026-03-16\",
    \"2026-06-07\"]}`.  Preset values are passed through to `value`
    verbatim, in both modes - a multi-week preset under
    `mode=\"single\"` selects those weeks rather than being narrowed
    to one or rejected, on the same \"the value is whatever you
    configured\" principle as `value` itself.

    `presets` is a list of dicts with keys:

    - label (string; optional)

    - value (list of strings; optional)

- theme (dict; optional):
    Mantine theme override, merged into this component's own isolated
    `MantineProvider` (this component ships its own private copy of
    `@mantine/core`, so it does not automatically inherit a host app's
    `MantineProvider` theme - pass the same theme dict the host app
    uses here instead).

- value (list of strings; optional):
    `[startISO, endISO]`, both ISO `YYYY-MM-DD` and already
    week-aligned (Monday/Sunday), e.g. `[\"2026-06-01\",
    \"2026-06-07\"]`. `[startISO, None]` while a range is
    mid-selection (one week picked so far, `mode=\"range\"` only).
    `[None, None]` (or unset) when empty.  The shape is the same in
    both modes - a single-week selection is just a range whose two
    borders belong to the same week - so switching `mode` never
    changes what a callback receives.

- withWeekNumbers (boolean; default True):
    Shows the ISO week-number column next to the calendar grid."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_week_range_picker'
    _type = 'WeekRangePickerInput'
    Presets = TypedDict(
        "Presets",
            {
            "label": NotRequired[str],
            "value": NotRequired[typing.Sequence[str]]
        }
    )

    LoadingState = TypedDict(
        "LoadingState",
            {
            "is_loading": NotRequired[bool],
            "prop_name": NotRequired[str],
            "component_name": NotRequired[str]
        }
    )


    def __init__(
        self,
        value: typing.Optional[typing.Sequence[str]] = None,
        mode: typing.Optional[Literal["single", "range"]] = None,
        minDate: typing.Optional[str] = None,
        maxDate: typing.Optional[str] = None,
        presets: typing.Optional[typing.Sequence["Presets"]] = None,
        placeholder: typing.Optional[str] = None,
        clearable: typing.Optional[bool] = None,
        closeOnChange: typing.Optional[bool] = None,
        withWeekNumbers: typing.Optional[bool] = None,
        highlightToday: typing.Optional[bool] = None,
        firstDayOfWeek: typing.Optional[NumberType] = None,
        theme: typing.Optional[dict] = None,
        forceColorScheme: typing.Optional[Literal["light", "dark"]] = None,
        className: typing.Optional[str] = None,
        style: typing.Optional[typing.Any] = None,
        persistence: typing.Optional[typing.Union[str, NumberType, bool]] = None,
        persisted_props: typing.Optional[typing.Sequence[str]] = None,
        persistence_type: typing.Optional[Literal["local", "session", "memory"]] = None,
        id: typing.Optional[typing.Union[str, dict]] = None,
        loading_state: typing.Optional["LoadingState"] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'className', 'clearable', 'closeOnChange', 'firstDayOfWeek', 'forceColorScheme', 'highlightToday', 'loading_state', 'maxDate', 'minDate', 'mode', 'persisted_props', 'persistence', 'persistence_type', 'placeholder', 'presets', 'style', 'theme', 'value', 'withWeekNumbers']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'className', 'clearable', 'closeOnChange', 'firstDayOfWeek', 'forceColorScheme', 'highlightToday', 'loading_state', 'maxDate', 'minDate', 'mode', 'persisted_props', 'persistence', 'persistence_type', 'placeholder', 'presets', 'style', 'theme', 'value', 'withWeekNumbers']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(WeekRangePickerInput, self).__init__(**args)

setattr(WeekRangePickerInput, "__init__", _explicitize_args(WeekRangePickerInput.__init__))
