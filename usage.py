from dash import Dash, callback, html, Input, Output

import dash_week_range_picker

app = Dash(__name__)

PRESETS = [
    {"label": "Last 4 Weeks", "value": ["2025-12-08", "2026-01-04"]},
    {"label": "Last 12 Weeks", "value": ["2025-10-13", "2026-01-04"]},
]

app.layout = html.Div(
    [
        dash_week_range_picker.WeekRangePickerInput(
            id="input",
            value=[None, None],
            minDate="2025-01-06",
            maxDate="2026-01-04",
            presets=PRESETS,
            persistence=True,
        ),
        html.Div(id="output"),
    ],
    style={"padding": "40px"},
)


@callback(Output("output", "children"), Input("input", "value"))
def display_output(value):
    return "value: {}".format(value)


if __name__ == "__main__":
    app.run(debug=True)
