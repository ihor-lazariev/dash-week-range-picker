import {useEffect, useState} from 'react';
import {DateStringValue} from '@mantine/dates';
import {isInRange, isoWeekEnd, isoWeekStart} from './dateUtils';

export type WeekRangeValue = [DateStringValue | null, DateStringValue | null];

/**
 * Range-selection state machine for a week-granularity calendar, adapted from the same shape as
 * Mantine's own (private, not importable outside @mantine/dates) `useDatesState` hook, but every date
 * that reaches `onChange` is first snapped to its ISO week's Monday/Sunday - clicking any day of a week
 * selects/commits that whole week, never an arbitrary day.
 *
 * `value`/`onChange` are fully controlled by the caller (this component always receives a `value` prop
 * from Dash, so there's no separate uncontrolled mode to support here, unlike Mantine's own pickers).
 */
export function useWeekRangeState(
    value: (DateStringValue | null)[] | undefined,
    onChange: (value: WeekRangeValue) => void
) {
    const _value: WeekRangeValue = Array.isArray(value)
        ? (value as WeekRangeValue)
        : [null, null];
    const [start, end] = _value;

    // the week picked on the first click of a still-incomplete range ([start, null])
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
        const weekStart = isoWeekStart(date);
        if (pickedWeekStart && !end) {
            const [lo, hi] = [pickedWeekStart, weekStart].sort();
            onChange([lo, isoWeekEnd(hi)]);
            return;
        }
        // fresh selection: nothing picked yet, or a previous complete range (clicking again restarts)
        onChange([weekStart, null]);
    };

    const handleDayMouseEnter = (date: DateStringValue) => {
        if (pickedWeekStart && !end) {
            setHoveredWeekStart(isoWeekStart(date));
        }
    };

    const onRootMouseLeave = () => setHoveredWeekStart(null);

    // the range currently shown highlighted: the committed value, or - mid-selection - the picked week
    // alone (before any hover) or picked-week-to-hovered-week (ordered low-to-high, hover can go either
    // direction from the anchor)
    const previewRange = (): WeekRangeValue => {
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
