# Dash Week Range Picker

Dash Week Range Picker is a Dash component library.

Mantine-based ISO-week range picker for Dash

## Usage

```python
import dash_week_range_picker

dash_week_range_picker.WeekRangePickerInput(
    id="period",
    value=["2026-06-01", "2026-06-14"],
    presets=[{"label": "Last 12 Weeks", "value": ["2026-03-16", "2026-06-07"]}],
)
```

Clicking any day selects that day's **whole ISO week** (Monday–Sunday), instead of the arbitrary single
day a normal date picker would give you. Use it wherever the underlying data only varies per week, so
picking a Wednesday over a Tuesday can't quietly imply a precision the numbers don't have.

The full prop list lives in the component's own docstring - `help(WeekRangePickerInput)`, or hover it in
an IDE.

### Value

`value` is always `[startISO, endISO]`, both `YYYY-MM-DD` and already week-aligned to a Monday and a
Sunday respectively:

| State                               | `value`                        |
| ----------------------------------- | ------------------------------ |
| Empty                               | `[None, None]` (or unset)      |
| Selected                            | `["2026-06-01", "2026-06-14"]` |
| Mid-selection (`mode="range"` only) | `["2026-06-01", None]`         |

This is the same shape a Dash range `DatePickerInput` emits, so it drops into callbacks written against
one unchanged.

### Modes

`mode` sets how many clicks a selection takes. It changes **only the interaction**, never the value
shape - a single week is just a range whose two borders belong to the same week, so `mode` can be
switched without touching a single callback:

- **`mode="range"`** (default) - two clicks, one per border. Either order works; clicking an earlier
  week second still yields an ordered `[start, end]`. Hover previews the range while it's half-picked.
- **`mode="single"`** - one click commits the whole week under the cursor, and each later click replaces
  it outright. Hover continuously previews the week a click would take, which is what tells the user the
  selection snaps to weeks rather than days; moving off the calendar without clicking restores whatever
  was committed.

### Nothing is auto-corrected

`value` and `presets` entries are rendered and emitted exactly as given, in both modes. A value spanning
three weeks under `mode="single"` shows a three-week band and reaches your callback as three weeks -
it is not narrowed to one, and not rejected. The same goes for switching `mode` while a wide value is
already selected.

That's deliberate. Silently narrowing a `Last 12 Weeks` preset down to one week would produce a result
that _looks_ right - the input fills in, the chart redraws - while quietly answering a different
question, which is the worst way for a BI tool to fail. Passing the value through is at least faithful
to what was configured, and the next calendar click brings it back to a single week anyway.

The one thing the component will not do is fight the app for control of `value`: it never calls
`setProps` to "fix" an incoming value, since a Dash callback writing that same prop back would loop.

### Gotcha: `minDate` decides which month opens first

With no `value` set, Mantine's own `Calendar` opens on `minDate`'s month whenever today is _after_
`minDate` - i.e. in the usual case of a `minDate` some way in the past, it opens there rather than on
the current month (`Calendar.mjs`, `minDate && dayjs(now).isAfter(minDate) ? minDate : now`). This is
upstream Mantine behaviour, not something this component adds, and it applies to both modes.

If that matters, keep `minDate` reasonably close to the range people actually pick in, or seed `value`
with the week you want the calendar to open on.

## Requirement: a page that already loads Mantine 8.x base styles

This component deliberately does **not** bundle `@mantine/core`/`@mantine/dates`'s own base CSS. It expects the host
page to already have that stylesheet loaded - in practice, via
[`dash-mantine-components`](https://pypi.org/project/dash-mantine-components/) (pinned to `8.3.18` to match), which any
app using this component almost certainly already has. Shipping a second copy inside our own bundle would double-inject
the same rules later in the page than the host's own copy, which silently wins the CSS cascade against any styling the
host has customized on top of Mantine's defaults - a host override of, say, the week-number column simply stops
applying, with nothing to indicate why.

If you use this component in a page with no other Mantine-based library loaded, import the styles yourself once, e.g.
`import '@mantine/core/styles.css'; import '@mantine/dates/styles.css';` in your own app - see `src/demo/index.js` for
exactly this, since the standalone demo app has no such host to rely on.

Both demos in this repo have to play that host role themselves, and each does it the way its own stack would:
`src/demo/index.js` (the webpack playground, `make serve`) imports the two stylesheets directly, while `usage.py` (the
Dash app, `make demo`) gets them from `dash-mantine-components`, which carries that stylesheet inside its own JS bundle.

On the Dash side, `import dash_mantine_components` is by itself enough to load it: Dash serves the assets of every
namespace in its `ComponentRegistry`, and a namespace registers at _import_ time, when the component metaclass defines
the generated classes. You do not need a dmc component in the layout. `usage.py` renders a `dmc.MantineProvider` anyway,
because that is what a real host app does (it sets the page-level theme) and it keeps the import a genuine use rather
than an import-for-side-effect.

`dash-mantine-components` is therefore in `requirements.txt` as a demo-only dependency; the published package's
`install_requires` stays empty, since any Mantine 8.x host will do.

Get started with:

1. Install Dash and its dependencies: https://dash.plotly.com/installation
2. Run `python usage.py`
3. Visit http://localhost:8050 in your web browser

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

### Install dependencies

If you have selected install_dependencies during the prompt, you can skip this part.

1. Install npm packages
    ```
    $ npm install
    ```
2. Create a virtual env and activate.

    ```
    $ virtualenv venv
    $ . venv/bin/activate
    ```

    _Note: venv\Scripts\activate for windows_

3. Install python packages required to build components.
    ```
    $ pip install -r requirements.txt
    ```
4. Install the python packages for the end-to-end tests (optional)
    ```
    $ make install-e2e
    ```

### Write your component code in `src/lib/components/DashWeekRangePicker.react.js`.

- The demo app is in `src/demo` and you will import your example component code into your demo app.
- Test your code in a Python environment:
    1. Build your code
        ```
        $ npm run build
        ```
    2. Run and modify the `usage.py` sample dash app:
        ```
        $ python usage.py
        ```
- Write tests for your component.
    - Logic lives in `src/lib/*.test.ts` (vitest, `make test`) - the ISO-week snapping and the selection state
      machine, with no browser involved.
    - End-to-end behaviour lives in `tests` (Playwright, `make test-e2e`): it starts `usage.py` on a free
      port and drives the shipped bundle in a real browser, covering what unit tests structurally cannot - the
      portal-rendered popover, hover previews, the Dash callback round-trip, and that the page is actually
      styled. One-time setup is `make install-e2e`.
    - The e2e suite deliberately avoids `dash[testing]`: its fixtures pin selenium to a urllib3<2 that conflicts
      with twine's, so they cannot share a venv with the build tooling. Starting the app over plain HTTP instead
      covers the same ground with no such constraint.
    - The Dash team uses these types of integration tests extensively. Browse the Dash component code on GitHub for more
      examples of testing (e.g. https://github.com/plotly/dash-core-components)
- Add custom styles to your component by putting your custom CSS files into your distribution folder
  (`dash_week_range_picker`).
    - Make sure that they are referenced in `MANIFEST.in` so that they get properly included when you're ready to
      publish your component.
    - Make sure the stylesheets are added to the `_css_dist` dict in `dash_week_range_picker/__init__.py` so dash will
      serve them automatically when the component suite is requested.
- [Review your code](./review_checklist.md)

### Create a production build and publish:

1. Build your code:
    ```
    $ npm run build
    ```
2. Create a Python distribution

    ```
    $ python setup.py sdist bdist_wheel
    ```

    This will create source and wheel distribution in the generated the `dist/` folder.
    See [PyPA](https://packaging.python.org/guides/distributing-packages-using-setuptools/#packaging-your-project)
    for more information.

3. Test your tarball by copying it into a new environment and installing it locally:

    ```
    $ pip install dash_week_range_picker-0.0.1.tar.gz
    ```

4. If it works, then you can publish the component to NPM and PyPI:
    1. Publish on PyPI
        ```
        $ twine upload dist/*
        ```
    2. Cleanup the dist folder (optional)
        ```
        $ rm -rf dist
        ```
    3. Publish on NPM (Optional if chosen False in `publish_on_npm`)
        ```
        $ npm publish
        ```
        _Publishing your component to NPM will make the JavaScript bundles available on the unpkg CDN. By default, Dash
        serves the component library's CSS and JS locally, but if you choose to publish the package to NPM you can set
        `serve_locally` to `False` and you may see faster load times._

5. Share your component with the community! https://community.plotly.com/c/dash
    1. Publish this repository to GitHub
    2. Tag your GitHub repository with the plotly-dash tag so that it appears
       here: https://github.com/topics/plotly-dash
    3. Create a post in the Dash community forum: https://community.plotly.com/c/dash
