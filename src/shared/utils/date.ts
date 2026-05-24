// src/shared/utils/date.ts

import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";

import localizedFormat from "dayjs/plugin/localizedFormat";

/*
|--------------------------------------------------------------------------
| Configure Plugins
|--------------------------------------------------------------------------
*/

dayjs.extend(relativeTime);

dayjs.extend(localizedFormat);

/*
|--------------------------------------------------------------------------
| Date Utils
|--------------------------------------------------------------------------
|
| Centralized date/time utilities.
|
| IMPORTANT:
| Never scatter date formatting logic
| across components/services.
|
*/

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

export const formatDate = (
    date?: string | Date
): string => {
    if (!date) {
        return "-";
    }

    return dayjs(date).format(
        "DD MMM YYYY"
    );
};

/*
|--------------------------------------------------------------------------
| Format DateTime
|--------------------------------------------------------------------------
*/

export const formatDateTime = (
    date?: string | Date
): string => {
    if (!date) {
        return "-";
    }

    return dayjs(date).format(
        "DD MMM YYYY hh:mm A"
    );
};

/*
|--------------------------------------------------------------------------
| Relative Time
|--------------------------------------------------------------------------
*/

export const fromNow = (
    date?: string | Date
): string => {
    if (!date) {
        return "-";
    }

    return dayjs(date).fromNow();
};

/*
|--------------------------------------------------------------------------
| Is Today
|--------------------------------------------------------------------------
*/

export const isToday = (
    date?: string | Date
): boolean => {
    if (!date) {
        return false;
    }

    return dayjs(date).isSame(
        dayjs(),
        "day"
    );
};

/*
|--------------------------------------------------------------------------
| Is Past
|--------------------------------------------------------------------------
*/

export const isPast = (
    date?: string | Date
): boolean => {
    if (!date) {
        return false;
    }

    return dayjs(date).isBefore(
        dayjs()
    );
};

/*
|--------------------------------------------------------------------------
| Minutes Difference
|--------------------------------------------------------------------------
*/

export const diffMinutes = (
    first: string | Date,
    second: string | Date
): number => {
    return dayjs(first).diff(
        dayjs(second),
        "minute"
    );
};

/*
|--------------------------------------------------------------------------
| Add Minutes
|--------------------------------------------------------------------------
*/

export const addMinutes = (
    date: string | Date,
    minutes: number
): string => {
    return dayjs(date)
        .add(minutes, "minute")
        .toISOString();
};

/*
|--------------------------------------------------------------------------
| Current Timestamp
|--------------------------------------------------------------------------
*/

export const now = (): string => {
    return dayjs().toISOString();
};

/*
|--------------------------------------------------------------------------
| Current Time
|--------------------------------------------------------------------------
*/

export const currentTime =
    (): string => {
        return dayjs().format(
            "HH:mm"
        );
    };

/*
|--------------------------------------------------------------------------
| Sleep Utility
|--------------------------------------------------------------------------
*/

export const sleep = (
    ms: number
): Promise<void> => {
    return new Promise(
        (resolve) => {
            setTimeout(
                resolve,
                ms
            );
        }
    );
};