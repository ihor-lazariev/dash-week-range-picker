"""Fixtures for the Playwright suite: one Dash server and one browser for the whole run.

The server is session-scoped because starting Dash costs about a second and nothing any test
does can affect the next one through it - all the state lives in the browser. The browser is
session-scoped too, via pytest-playwright's own `browser` fixture, so Chromium launches once.

`page`/`context` stay function-scoped on purpose: usage.py sets `persistence=True`, so a
shared context would carry a picker's value into the next test through localStorage. A fresh
context per test costs milliseconds (the expensive part is the browser launch, which is
already shared) and buys real isolation.
"""

import ast
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

import pytest
from playwright.sync_api import expect

REPO_ROOT = Path(__file__).resolve().parents[1]
STARTUP_TIMEOUT = 60


def _free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


@pytest.fixture(scope="session")
def dash_url():
    """Run usage.py on a free port and yield its URL.

    Started via `-c` rather than `usage.py` so `debug` stays False: Dash's debug reloader
    runs a parent plus a child, and the child outlives a terminate() on the parent and keeps
    the socket (the reason `make kill-port` exists). A free port also means a developer's own
    `make demo` on :8050 can keep running while the suite does.
    """
    port = _free_port()
    proc = subprocess.Popen(
        [
            sys.executable,
            "-c",
            f"import usage; usage.app.run(host='127.0.0.1', port={port}, debug=False)",
        ],
        cwd=REPO_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    url = f"http://127.0.0.1:{port}"
    deadline = time.time() + STARTUP_TIMEOUT
    while time.time() < deadline:
        if proc.poll() is not None:
            output = proc.stdout.read().decode(errors="replace")
            raise RuntimeError(f"usage.py exited before serving:\n{output}")
        try:
            urllib.request.urlopen(url, timeout=1)
            break
        except (urllib.error.URLError, OSError):
            time.sleep(0.2)
    else:
        proc.terminate()
        raise RuntimeError(f"usage.py did not serve {url} within {STARTUP_TIMEOUT}s")

    yield url

    proc.terminate()
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        proc.kill()


class WeekPicker:
    """Page object for one WeekRangePickerInput plus the html.Div echoing its value.

    Days are addressed by real `datetime.date`, not by grid position: Mantine labels every day
    button `aria-label="18 August 2025"`, which makes assertions read in terms of the dates the
    component is actually supposed to emit.
    """

    def __init__(self, page, picker_id, output_id):
        self.page = page
        self.picker_id = picker_id
        self.output_id = output_id

    # --- structure -----------------------------------------------------------------
    @property
    def dropdown(self):
        # Mantine renders the popover in a portal at body level, so it is NOT inside the
        # component's own wrapper div. Only ever open one picker at a time.
        return self.page.locator(".mantine-Popover-dropdown")

    @property
    def output(self):
        return self.page.locator(f"#{self.output_id}")

    @property
    def trigger(self):
        """The input itself - a button, which is what PickerInputBase renders."""
        return self.page.locator(f"#{self.picker_id} button")

    def open(self):
        self.trigger.click()
        self.dropdown.wait_for()
        return self

    def close(self):
        self.page.keyboard.press("Escape")
        self.dropdown.wait_for(state="hidden")
        return self

    # --- navigation ----------------------------------------------------------------
    def _visible_month(self):
        label = self.dropdown.locator(
            ".mantine-Calendar-calendarHeaderLevel"
        ).inner_text()
        return datetime.strptime(label.strip(), "%B %Y").date()

    def goto_month(self, target):
        """Page the calendar until `target`'s month is on screen.

        Needed because with no value set Mantine opens the calendar on minDate's month
        rather than today's (see the README gotcha), so the month in view is not the one
        a test wants often enough to matter.
        """
        for _ in range(60):
            current = self._visible_month()
            if (current.year, current.month) == (target.year, target.month):
                return self
            forward = (target.year, target.month) > (current.year, current.month)
            direction = "next" if forward else "previous"
            # scoped to `button`: the control's own svg icon carries data-direction too
            self.dropdown.locator(f'button[data-direction="{direction}"]').click()
        raise AssertionError(f"could not page the calendar to {target:%B %Y}")

    # --- interaction ---------------------------------------------------------------
    def day(self, day):
        label = f"{day.day} {day:%B} {day.year}"
        return self.dropdown.locator(f'button[aria-label="{label}"]')

    def click_day(self, day):
        self.goto_month(day)
        self.day(day).click()
        return self

    def hover_day(self, day):
        self.goto_month(day)
        self.day(day).hover()
        return self

    def leave_calendar(self):
        """Move the pointer off the grid, which is what clears the hover preview."""
        self.page.mouse.move(2, 2)
        return self

    def click_preset(self, label):
        self.dropdown.locator(".wrp-preset-button", has_text=label).click()
        return self

    # --- reading back ---------------------------------------------------------------
    def value(self):
        return ast.literal_eval(self.output.inner_text().split("value: ", 1)[1])

    def expect_value(self, expected):
        """Wait for the Dash callback round-trip to land on `expected`."""
        expect(self.output).to_have_text(f"value: {expected!r}")
        return self

    def highlighted(self):
        """Every date currently drawn as part of the band, read back off the grid.

        Covers the plain in-range fill and both boundary cells; the union is deduplicated
        because a boundary day carries several of these attributes at once.
        """
        return self._dates_of(
            "[data-in-range], [data-first-in-range],"
            " [data-last-in-range], [data-selected]"
        )

    def rendered_days(self):
        """Every date the grid currently draws, including the adjacent-month spill.

        Bands wider than a week can run past the edge of one month's grid, so tests compare
        against `expected & rendered_days()` rather than assuming the whole span is on screen.
        """
        return self._dates_of("button.mantine-Calendar-day")

    def _dates_of(self, selector):
        labels = self.dropdown.locator(selector).evaluate_all(
            "els => els.map((e) => e.getAttribute('aria-label'))"
        )
        return {datetime.strptime(x, "%d %B %Y").date() for x in labels if x}


@pytest.fixture
def home(page, dash_url):
    page.goto(dash_url)
    page.wait_for_selector("#input-single")
    return page


@pytest.fixture
def single(home):
    """The `mode="single"` picker from usage.py."""
    return WeekPicker(home, "input-single", "output-single")


@pytest.fixture
def ranged(home):
    """The default `mode="range"` picker from usage.py."""
    return WeekPicker(home, "input", "output")
