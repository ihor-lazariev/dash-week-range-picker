"""Browser coverage for WeekRangePickerInput, driven against the real usage.py app.

These are the cases the vitest suite structurally cannot reach: Mantine's actual DOM and CSS,
a real Dash callback round-trip, and the portal-rendered popover. The state machine itself is
unit-tested in src/lib/useWeekRangeState.test.ts - the point here is that it is wired up to
something a person can click, and that it still looks right once it is.

Every date is derived from the current week, since usage.py builds its bounds and presets
that way too; nothing is pinned to a calendar date that would rot.
"""

from datetime import timedelta

from dates import (
    THIS_MONDAY,
    WEEK_A,
    WEEK_B,
    days_between,
    iso,
    monday_of,
    span,
    sunday_of,
    week_of,
)

# Mantine indigo-6, the primaryColor usage.py hands to both providers. Stable because
# package.json and requirements.txt pin @mantine/* to the same 8.3.18.
INDIGO_6 = "rgb(76, 110, 245)"

WIDE_PRESET = "3 Weeks (wide, passes through)"
WIDE_START = THIS_MONDAY - timedelta(weeks=3)
WIDE_END = THIS_MONDAY - timedelta(days=1)


class TestInitialRender:
    """Smoke test: both pickers mount and start empty."""

    def test_both_pickers_mount_empty_showing_their_placeholders(self, single, ranged):
        single.expect_value([None, None])
        ranged.expect_value([None, None])
        assert "Select Week" in single.trigger.inner_text()
        assert "Select Period" in ranged.trigger.inner_text()


class TestSingleMode:
    def test_one_click_selects_the_whole_week(self, single):
        single.open().click_day(WEEK_A)

        single.expect_value([iso(monday_of(WEEK_A)), iso(sunday_of(WEEK_A))])
        start, end = single.value()
        assert (
            days_between(start, end) == 6
        ), "a single-mode pick spans exactly one week"

    def test_a_second_click_replaces_rather_than_extends(self, single):
        single.open().click_day(WEEK_A)
        single.expect_value([iso(monday_of(WEEK_A)), iso(sunday_of(WEEK_A))])

        single.click_day(WEEK_B)
        # range mode would have grown this into a two-week span; single mode swaps the week
        single.expect_value([iso(monday_of(WEEK_B)), iso(sunday_of(WEEK_B))])

    def test_hover_previews_a_whole_week_without_committing(self, single):
        single.open().hover_day(WEEK_A)

        assert single.highlighted() == week_of(WEEK_A)
        # hover is local component state - it must never reach setProps
        assert single.value() == [None, None]

    def test_leaving_the_calendar_restores_the_committed_week(self, single):
        single.open().click_day(WEEK_A)
        single.expect_value([iso(monday_of(WEEK_A)), iso(sunday_of(WEEK_A))])

        single.hover_day(WEEK_B)
        assert single.highlighted() == week_of(WEEK_B), "preview follows the cursor"

        single.leave_calendar()
        assert single.highlighted() == week_of(WEEK_A), "committed week comes back"
        assert single.value() == [iso(monday_of(WEEK_A)), iso(sunday_of(WEEK_A))]

    def test_a_one_week_preset_selects_that_week(self, single):
        single.open().click_preset("Last Week")

        single.expect_value(
            [
                iso(THIS_MONDAY - timedelta(weeks=1)),
                iso(THIS_MONDAY - timedelta(days=1)),
            ]
        )

    def test_a_wide_preset_passes_through_unchanged(self, single):
        single.open().click_preset(WIDE_PRESET)

        # deliberately NOT narrowed to one week, and not rejected - see the README
        single.expect_value([iso(WIDE_START), iso(WIDE_END)])
        single.leave_calendar()
        expected = span(WIDE_START, WIDE_END)
        assert len(expected) == 21
        # the band can run past the edge of one month's grid, so compare on what is on screen
        assert single.highlighted() == expected & single.rendered_days()

    def test_a_click_after_a_wide_preset_collapses_back_to_one_week(self, single):
        single.open().click_preset(WIDE_PRESET)
        single.expect_value([iso(WIDE_START), iso(WIDE_END)])

        single.click_day(WEEK_A)
        single.expect_value([iso(monday_of(WEEK_A)), iso(sunday_of(WEEK_A))])


class TestRangeMode:
    def test_two_clicks_build_a_range(self, ranged):
        ranged.open().click_day(WEEK_A)
        # mid-selection: one week picked, the second border still open
        ranged.expect_value([iso(monday_of(WEEK_A)), None])

        ranged.click_day(WEEK_B)
        ranged.expect_value([iso(monday_of(WEEK_A)), iso(sunday_of(WEEK_B))])

    def test_clicking_the_earlier_week_second_still_orders_the_range(self, ranged):
        ranged.open().click_day(WEEK_B)
        ranged.expect_value([iso(monday_of(WEEK_B)), None])

        ranged.click_day(WEEK_A)  # earlier than the anchor
        ranged.expect_value([iso(monday_of(WEEK_A)), iso(sunday_of(WEEK_B))])

    def test_hover_does_not_preview_once_the_range_is_complete(self, ranged):
        ranged.open().click_day(WEEK_A)
        ranged.click_day(WEEK_B)
        ranged.expect_value([iso(monday_of(WEEK_A)), iso(sunday_of(WEEK_B))])
        committed = span(monday_of(WEEK_A), sunday_of(WEEK_B))

        ranged.hover_day(WEEK_A)
        # unlike single mode, a settled range ignores hover entirely
        assert ranged.highlighted() == committed & ranged.rendered_days()


class TestHostIntegration:
    """The component ships no CSS and no theme of its own - both come from the host page.

    Neither can fail loudly: without the stylesheet the picker still works and still emits
    correct values, it just renders as unstyled HTML. These two assert on computed style so
    that stays visible.
    """

    def test_mantine_base_styles_are_loaded(self, single):
        single.open()

        # an unstyled popover is a plain div: transparent, no radius. Drop the
        # dash-mantine-components import from usage.py and this is what you get.
        styles = single.dropdown.evaluate(
            "el => { const s = getComputedStyle(el);"
            " return {bg: s.backgroundColor, radius: s.borderRadius}; }"
        )
        assert styles["bg"] not in ("rgba(0, 0, 0, 0)", "transparent")
        assert styles["radius"] != "0px"

    def test_the_host_theme_reaches_the_components_own_provider(self, single):
        single.open().click_day(WEEK_A)
        single.expect_value([iso(monday_of(WEEK_A)), iso(sunday_of(WEEK_A))])
        single.leave_calendar()

        # the component nests its own MantineProvider and does NOT inherit the host's, so
        # this passes only because usage.py also hands the theme to the `theme` prop
        selected = single.dropdown.locator("[data-selected]").first
        background = selected.evaluate("el => getComputedStyle(el).backgroundColor")
        assert background == INDIGO_6
