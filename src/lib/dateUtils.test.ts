import {describe, it, expect} from 'vitest';
import {isoWeekStart, isoWeekEnd, isInRange} from './dateUtils';

// Reference week used across tests: Mon 2026-06-01 .. Sun 2026-06-07 (2026-06-01 is a Monday).
describe('isoWeekStart', () => {
    it('snaps a mid-week day back to that ISO week Monday', () => {
        expect(isoWeekStart('2026-06-03')).toBe('2026-06-01'); // Wed -> Mon
    });

    it('returns the same date when already a Monday', () => {
        expect(isoWeekStart('2026-06-01')).toBe('2026-06-01');
    });

    it('snaps a Sunday back to the Monday of the SAME ISO week (not the next)', () => {
        // ISO weeks run Mon..Sun, so Sunday belongs to the week that started 6 days earlier.
        expect(isoWeekStart('2026-06-07')).toBe('2026-06-01');
    });

    it('handles the ISO year boundary (Jan 1 2026 is a Thursday)', () => {
        expect(isoWeekStart('2026-01-01')).toBe('2025-12-29');
    });
});

describe('isoWeekEnd', () => {
    it('snaps a mid-week day forward to that ISO week Sunday', () => {
        expect(isoWeekEnd('2026-06-03')).toBe('2026-06-07'); // Wed -> Sun
    });

    it('returns the same date when already a Sunday', () => {
        expect(isoWeekEnd('2026-06-07')).toBe('2026-06-07');
    });

    it('handles the ISO year boundary', () => {
        expect(isoWeekEnd('2026-01-01')).toBe('2026-01-04');
    });
});

describe('isInRange', () => {
    const range: [string, string] = ['2026-06-01', '2026-06-07'];

    it('is true inside the range and inclusive on both bounds', () => {
        expect(isInRange('2026-06-03', range)).toBe(true);
        expect(isInRange('2026-06-01', range)).toBe(true); // start inclusive
        expect(isInRange('2026-06-07', range)).toBe(true); // end inclusive
    });

    it('is false just outside either bound', () => {
        expect(isInRange('2026-05-31', range)).toBe(false);
        expect(isInRange('2026-06-08', range)).toBe(false);
    });
});
