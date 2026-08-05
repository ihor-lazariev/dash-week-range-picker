from datetime import date, timedelta

from dash import Dash, callback, html, Input, Output

import dash_week_range_picker

app = Dash(__name__)

TODAY = date.today()
# .weekday() is 0 for Monday, so this is always the Monday of the current ISO week
THIS_MONDAY = TODAY - timedelta(days=TODAY.weekday())


def week_of(offset_weeks):
    """[Monday, Sunday] of the week `offset_weeks` away from the current one."""
    monday = THIS_MONDAY + timedelta(weeks=offset_weeks)
    return [monday.isoformat(), (monday + timedelta(days=6)).isoformat()]


def last_n_weeks(n):
    """The last `n` complete weeks, i.e. ending last Sunday.

    Counts back in whole weeks and only then takes the borders. Doing day-precise math first
    (`timedelta(weeks=n, days=-1)`) and snapping the result afterwards miscounts by a variable
    amount depending on what weekday it happens to be run on.
    """
    return [
        (THIS_MONDAY - timedelta(weeks=n)).isoformat(),
        (THIS_MONDAY - timedelta(days=1)).isoformat(),
    ]


PRESETS = [
    {"label": "Last 4 Weeks", "value": last_n_weeks(4)},
    {"label": "Last 12 Weeks", "value": last_n_weeks(12)},
]

# single mode still takes [start, end] pairs - these are just one week wide. The last one deliberately
# is not: preset values pass through verbatim in both modes, so it selects all 3 weeks (and the next
# calendar click replaces it with a single one) - here to eyeball that documented behaviour.
SINGLE_PRESETS = [
    {"label": "Last Week", "value": week_of(-1)},
    {"label": "Week Before", "value": week_of(-2)},
    {"label": "3 Weeks (wide, passes through)", "value": last_n_weeks(3)},
]

MIN_DATE = (THIS_MONDAY - timedelta(weeks=52)).isoformat()
MAX_DATE = (THIS_MONDAY + timedelta(days=6)).isoformat()  # end of the current week

app.layout = html.Div(
    [
        html.Div(
            [
                html.H4('mode="range" (default)'),
                dash_week_range_picker.WeekRangePickerInput(
                    id="input",
                    value=[None, None],
                    minDate=MIN_DATE,
                    maxDate=MAX_DATE,
                    presets=PRESETS,
                    persistence=True,
                ),
                html.Div(id="output"),
            ]
        ),
        html.Div(
            [
                html.H4('mode="single"'),
                dash_week_range_picker.WeekRangePickerInput(
                    id="input-single",
                    mode="single",
                    value=[None, None],
                    minDate=MIN_DATE,
                    maxDate=MAX_DATE,
                    presets=SINGLE_PRESETS,
                    placeholder="Select Week",
                    persistence=True,
                ),
                html.Div(id="output-single"),
            ]
        ),
    ],
    style={"padding": "40px", "display": "flex", "gap": "40px"},
)


@callback(Output("output", "children"), Input("input", "value"))
def display_output(value):
    return "value: {}".format(value)


# identical callback signature to the range one above - the whole point of keeping [start, end] in both
# modes is that switching `mode` never touches the callback side
@callback(Output("output-single", "children"), Input("input-single", "value"))
def display_single_output(value):
    return "value: {}".format(value)


if __name__ == "__main__":
    app.run(debug=True)
