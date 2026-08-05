import {useEffect, useState} from 'react';
import {DateStringValue} from '@mantine/dates';
import {isInRange, isoWeekEnd, isoWeekRange, isoWeekStart} from './dateUtils';

export type WeekRangeValue = [DateStringValue | null, DateStringValue | null];

/**
 * How clicks build a value: `"range"` takes two clicks (one per border), `"single"` commits the whole
 * week under the cursor on the first click.
 */
export type WeekPickerMode = 'single' | 'range';

/**
 * Selection state machine for a week-granularity calendar, adapted from the same shape as Mantine's own
 * (private, not importable outside @mantine/dates) `useDatesState` hook, but every date that reaches
 * `onChange` is first snapped to its ISO week's Monday/Sunday - clicking any day of a week
 * selects/commits that whole week, never an arbitrary day.
 *
 * `value`/`onChange` are fully controlled by the caller (this component always receives a `value` prop
 * from Dash, so there's no separate uncontrolled mode to support here, unlike Mantine's own pickers).
 *
 * `mode` constrains only how clicks *build* a value, never what a value is allowed to *be*: both modes
 * emit the same `[startISO, endISO]` shape, and neither ever rewrites a value handed in from the
 * outside. A wider-than-one-week value under `mode="single"` therefore renders as the range it honestly
 * is (and the next click replaces it with a single week) rather than being narrowed or rejected.
 */
export function useWeekRangeState(
    value: (DateStringValue | null)[] | undefined,
    onChange: (value: WeekRangeValue) => void,
    mode: WeekPickerMode = 'range'
) {
    const _value: WeekRangeValue = Array.isArray(value)
        ? (value as WeekRangeValue)
        : [null, null];
    const [start, end] = _value;
    const isSingle = mode === 'single';

    // the week picked on the first click of a still-incomplete range ([start, null]) - range mode only,
    // since a single-mode click commits both borders at once and so has no half-picked state to hold
    const [pickedWeekStart, setPickedWeekStart] =
        useState<DateStringValue | null>(start && !end ? start : null);
    const [hoveredWeekStart, setHoveredWeekStart] =
        useState<DateStringValue | null>(null);

    // re-sync when `value` changes from the outside (preset click, clear button, or a completed range) -
    // mirrors Mantine's own useDatesState effect
    useEffect(() => {
        setPickedWeekStart(start && !end ? start : null);
        setHoveredWeekStart(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start, end]);

    const handleDayClick = (date: DateStringValue) => {
        // single: the first click is the entire selection, and it always replaces whatever was there -
        // including a wider range that arrived from a preset or straight from the `value` prop
        if (isSingle) {
            onChange(isoWeekRange(date));
            return;
        }
        const weekStart = isoWeekStart(date);
        if (pickedWeekStart && !end) {
            const [lo, hi] = [pickedWeekStart, weekStart].sort();
            onChange([lo, isoWeekEnd(hi)]);
            return;
        }
        // fresh selection: nothing picked yet, or a previous complete range (clicking again restarts)
        onChange([weekStart, null]);
    };

    // single mode previews continuously: there's no mid-selection state to gate on, and the whole-week
    // highlight under the cursor is the only thing telling the user a click takes the week rather than
    // the day. Range mode keeps previewing only while a range is half-picked, so a committed range
    // never flickers on hover.
    const handleDayMouseEnter = (date: DateStringValue) => {
        if (isSingle || (pickedWeekStart && !end)) {
            setHoveredWeekStart(isoWeekStart(date));
        }
    };

    // hover lives in local state and never reaches onChange/setProps, so moving the cursor off the grid
    // without clicking restores the committed value for free - previewRange is only ever a derived read
    // of it, the committed value is never overwritten to begin with
    const onRootMouseLeave = () => setHoveredWeekStart(null);

    // the range currently shown highlighted: the committed value, or - mid-selection - the picked week
    // alone (before any hover) or picked-week-to-hovered-week (ordered low-to-high, hover can go either
    // direction from the anchor)
    const previewRange = (): WeekRangeValue => {
        if (isSingle) {
            // the hovered week wins while the cursor is over the grid (it previews what a click would
            // commit); otherwise the committed value shows exactly as-is, however wide it happens to be
            if (hoveredWeekStart) {
                return isoWeekRange(hoveredWeekStart);
            }
            if (start && end) {
                return [start, end];
            }
            // a half-picked [start, null] can only arrive from the outside here (persisted range-mode
            // value, or a mode switch mid-selection) - show it as the week it points at
            return start ? isoWeekRange(start) : [null, null];
        }
        if (start && end) {
            return [start, end];
        }
        const anchor = start || pickedWeekStart;
        if (!anchor) {
            return [null, null];
        }
        const other = hoveredWeekStart || anchor;
        const [lo, hi] = [anchor, other].sort();
        return [lo, isoWeekEnd(hi)];
    };

    const getDayProps = (date: DateStringValue) => {
        const [rangeStart, rangeEnd] = previewRange();
        const inRange = !!(
            rangeStart &&
            rangeEnd &&
            isInRange(date, [rangeStart, rangeEnd])
        );
        // rangeStart/rangeEnd are always the exact Monday/Sunday anchors (never an arbitrary clicked
        // day), so plain equality - not "same ISO week" - is what picks out just the two boundary cells:
        // bold "selected" + sharp edge only on the Monday of the start week and the Sunday of the end
        // week, everything else in between (including the rest of those same two weeks) stays the plain
        // light "inRange" band, matching Mantine's own day-granularity range look
        return {
            onClick: () => handleDayClick(date),
            onMouseEnter: () => handleDayMouseEnter(date),
            selected: inRange && (date === rangeStart || date === rangeEnd),
            inRange,
            firstInRange: inRange && date === rangeStart,
            lastInRange: inRange && date === rangeEnd,
        };
    };

    return {value: _value, getDayProps, onRootMouseLeave};
}
