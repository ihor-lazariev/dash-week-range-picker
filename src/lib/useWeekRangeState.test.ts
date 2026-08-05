import {describe, it, expect, vi} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useWeekRangeState} from './useWeekRangeState';

// Reference weeks (all Mondays/Sundays verified):
//   week A: Mon 2026-06-01 .. Sun 2026-06-07
//   week B: Mon 2026-06-08 .. Sun 2026-06-14
//   week C: Mon 2026-06-29 .. Sun 2026-07-05  (2026-07-01 is a Wednesday)

type HookResult = {current: ReturnType<typeof useWeekRangeState>};

const click = (result: HookResult, date: string) => {
    act(() => {
        result.current.getDayProps(date).onClick();
    });
};

const hover = (result: HookResult, date: string) => {
    act(() => {
        result.current.getDayProps(date).onMouseEnter();
    });
};

const leave = (result: HookResult) => {
    act(() => {
        result.current.onRootMouseLeave();
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

    it('does not preview on hover once a range is complete (only mid-selection does)', () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useWeekRangeState(['2026-06-01', '2026-06-14'], onChange)
        );
        hover(result, '2026-07-01'); // week C, far outside the committed range
        expect(result.current.getDayProps('2026-06-29').inRange).toBe(false);
        expect(result.current.getDayProps('2026-06-08').inRange).toBe(true);
    });
});

describe('useWeekRangeState - single mode', () => {
    it('commits the whole week on the FIRST click, both borders at once', () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useWeekRangeState([null, null], onChange, 'single')
        );
        click(result, '2026-06-03'); // Wed of week A
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(['2026-06-01', '2026-06-07']);
    });

    it('replaces the selection outright on a later click, never extends it', () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useWeekRangeState(['2026-06-01', '2026-06-07'], onChange, 'single')
        );
        click(result, '2026-06-10'); // Wed of week B
        // range mode would have grown this into 2026-06-01..2026-06-14; single mode swaps the week
        expect(onChange).toHaveBeenCalledWith(['2026-06-08', '2026-06-14']);
    });

    it('previews the hovered week without emitting, and restores the committed one on mouse-leave', () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useWeekRangeState(['2026-06-01', '2026-06-07'], onChange, 'single')
        );
        hover(result, '2026-06-10'); // week B
        expect(result.current.getDayProps('2026-06-08').inRange).toBe(true);
        expect(result.current.getDayProps('2026-06-01').inRange).toBe(false);
        expect(onChange).not.toHaveBeenCalled(); // hover is local state only, never a setProps

        leave(result);
        expect(result.current.getDayProps('2026-06-01').inRange).toBe(true);
        expect(result.current.getDayProps('2026-06-08').inRange).toBe(false);
    });

    it('renders a wider-than-one-week value as-is instead of narrowing it', () => {
        const onChange = vi.fn();
        // 3 weeks, e.g. straight from a multi-week preset - deliberately not auto-corrected
        const {result} = renderHook(() =>
            useWeekRangeState(['2026-06-01', '2026-06-21'], onChange, 'single')
        );
        expect(result.current.getDayProps('2026-06-01').firstInRange).toBe(
            true
        );
        expect(result.current.getDayProps('2026-06-15').inRange).toBe(true);
        expect(result.current.getDayProps('2026-06-21').lastInRange).toBe(true);
        expect(onChange).not.toHaveBeenCalled();

        // ...and the next click quietly brings it back to a single week
        click(result, '2026-07-01'); // Wed of week C
        expect(onChange).toHaveBeenCalledWith(['2026-06-29', '2026-07-05']);
    });
});
