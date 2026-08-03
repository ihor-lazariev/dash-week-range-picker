import {describe, it, expect, vi} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useWeekRangeState} from './useWeekRangeState';

// Reference weeks (all Mondays/Sundays verified):
//   week A: Mon 2026-06-01 .. Sun 2026-06-07
//   week B: Mon 2026-06-08 .. Sun 2026-06-14
//   week C: Mon 2026-06-29 .. Sun 2026-07-05  (2026-07-01 is a Wednesday)
const click = (
    result: {current: ReturnType<typeof useWeekRangeState>},
    date: string
) => {
    act(() => {
        result.current.getDayProps(date).onClick();
    });
};

describe('useWeekRangeState', () => {
    it('single pick: first click on an empty value commits [weekStart, null] (snapped to Monday)', () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useWeekRangeState([null, null], onChange)
        );
        click(result, '2026-06-03'); // Wed of week A
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(['2026-06-01', null]);
    });

    it('complete range (forward): second, later click commits [startMonday, endSunday]', () => {
        const onChange = vi.fn();
        // mid-selection: week A already picked
        const {result} = renderHook(() =>
            useWeekRangeState(['2026-06-01', null], onChange)
        );
        click(result, '2026-06-10'); // Wed of week B
        expect(onChange).toHaveBeenCalledWith(['2026-06-01', '2026-06-14']);
    });

    it('reverse order: second click EARLIER than the anchor still yields an ordered range', () => {
        const onChange = vi.fn();
        // mid-selection anchor is week B; user then clicks into the earlier week A
        const {result} = renderHook(() =>
            useWeekRangeState(['2026-06-08', null], onChange)
        );
        click(result, '2026-06-03'); // Wed of week A (earlier than anchor)
        // start snaps to the earlier Monday, end to the later week's Sunday
        expect(onChange).toHaveBeenCalledWith(['2026-06-01', '2026-06-14']);
    });

    it('restart: clicking after a completed range starts a fresh single pick', () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useWeekRangeState(['2026-06-01', '2026-06-14'], onChange)
        );
        click(result, '2026-07-01'); // Wed of week C
        expect(onChange).toHaveBeenCalledWith(['2026-06-29', null]);
    });

    it('marks the two boundary cells selected and the span inRange for a completed value', () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useWeekRangeState(['2026-06-01', '2026-06-14'], onChange)
        );
        const start = result.current.getDayProps('2026-06-01');
        const end = result.current.getDayProps('2026-06-14');
        const middle = result.current.getDayProps('2026-06-08');
        expect(start.firstInRange).toBe(true);
        expect(start.selected).toBe(true);
        expect(end.lastInRange).toBe(true);
        expect(end.selected).toBe(true);
        expect(middle.inRange).toBe(true);
        expect(middle.selected).toBe(false); // in the band, but not a boundary
    });
});
