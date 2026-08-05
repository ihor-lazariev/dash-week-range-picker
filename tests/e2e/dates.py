"""Date arithmetic for the e2e suite.

Deliberately re-derived here rather than imported from usage.py: usage.py builds its own
bounds and presets from today, and a test that reused that same code would agree with it
even when both were wrong.
"""

from datetime import date, timedelta


def monday_of(day):
    return day - timedelta(days=day.weekday())


def sunday_of(day):
    return monday_of(day) + timedelta(days=6)


def week_of(day):
    """Every date in `day`'s ISO week, as a set - what the band should light up."""
    start = monday_of(day)
    return {start + timedelta(days=n) for n in range(7)}


def span(start, end):
    """Every date from `start` to `end` inclusive."""
    return {start + timedelta(days=n) for n in range((end - start).days + 1)}


def iso(day):
    return day.isoformat()


def days_between(start_iso, end_iso):
    return (date.fromisoformat(end_iso) - date.fromisoformat(start_iso)).days


TODAY = date.today()
THIS_MONDAY = monday_of(TODAY)

# Two days exactly a week apart, pinned to the 10th/17th of a month a few weeks back. Both
# their ISO weeks then fall entirely inside that one month (the week of the 10th starts no
# earlier than the 4th, the week of the 17th ends no later than the 23rd), so both render in
# the same calendar grid - which the hover/restore tests need in order to compare bands
# without paging the calendar between assertions. Six weeks back keeps them comfortably
# inside usage.py's own min/max window.
_BASE = THIS_MONDAY - timedelta(weeks=6)
WEEK_A = date(_BASE.year, _BASE.month, 10)
WEEK_B = WEEK_A + timedelta(days=7)
