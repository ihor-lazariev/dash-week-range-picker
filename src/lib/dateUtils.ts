import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import {DateStringValue} from '@mantine/dates';

// registered once at module load, not per-render/per-click
dayjs.extend(isoWeek);

export const ISO_FORMAT = 'YYYY-MM-DD';

// the Monday (ISO weekday 1) of the week containing `date` - use isoWeek (not week/day, which
// are locale-dependent, e.g. Sunday-start in the "en" locale) so this never disagrees with the
// backend's ISO week-date math (Python's %G/%V/%u, see utils/dates.py::convert_week_to_period)
export function isoWeekStart(date: DateStringValue): DateStringValue {
    return dayjs(date).startOf('isoWeek').format(ISO_FORMAT);
}

// the Sunday (ISO weekday 7) of the week containing `date`
export function isoWeekEnd(date: DateStringValue): DateStringValue {
    return dayjs(date).endOf('isoWeek').format(ISO_FORMAT);
}

// plain ISO-string comparison - 'YYYY-MM-DD' sorts lexicographically the same as chronologically
export function isInRange(
    date: DateStringValue,
    [start, end]: [DateStringValue, DateStringValue]
): boolean {
    return date >= start && date <= end;
}
