from dash.testing.application_runners import import_app


# Basic smoke test: the component renders and shows its placeholder text when empty.
# Clicking through the actual week-selection flow needs a browser-driven test against Mantine's
# real DOM (button/input structure), not covered here yet - see the plan's manual verification steps.
def test_render_component(dash_duo):
    app = import_app('usage')
    dash_duo.start_server(app)

    dash_duo.wait_for_element('#input')
    dash_duo.wait_for_text_to_equal('#output', 'value: [None, None]')
