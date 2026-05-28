// src/shared/utils/validation.ts

/*
|--------------------------------------------------------------------------
| Validation Utilities
|--------------------------------------------------------------------------
|
| Centralized reusable validation helpers.
|
| IMPORTANT:
| Never duplicate validation logic across:
| - screens
| - services
| - parsers
| - stores
|
| Benefits:
| - consistent validation
| - reusable rules
| - cleaner business logic
| - scalable form architecture
|
*/

/*
|--------------------------------------------------------------------------
| Required String
|--------------------------------------------------------------------------
*/

export const isRequired =
    (
        value?: string | null
    ): boolean => {
        return !!value?.trim();
    };

/*
|--------------------------------------------------------------------------
| Email Validation
|--------------------------------------------------------------------------
*/

export const isValidEmail =
    (
        email?: string
    ): boolean => {
        if (!email) {
            return false;
        }

        const regex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return regex.test(email);
    };

/*
|--------------------------------------------------------------------------
| Positive Number
|--------------------------------------------------------------------------
*/

export const isPositiveNumber =
    (
        value?: number
    ): boolean => {
        if (
            value === undefined ||
            value === null
        ) {
            return false;
        }

        return value > 0;
    };

/*
|--------------------------------------------------------------------------
| Valid Interval
|--------------------------------------------------------------------------
*/

export const isValidInterval =
    (
        minutes?: number
    ): boolean => {
        if (
            minutes === undefined ||
            minutes === null ||
            !isPositiveNumber(
                minutes
            )
        ) {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Safety Limits
        |--------------------------------------------------------------------------
        */

        return (
            minutes >= 1 &&
            minutes <= 10080
        );
    };

/*
|--------------------------------------------------------------------------
| Workflow Name
|--------------------------------------------------------------------------
*/

export const isValidWorkflowName =
    (
        name?: string
    ): boolean => {
        if (!name) {
            return false;
        }

        return (
            name.trim().length >=
            3 &&
            name.trim().length <=
            120
        );
    };

/*
|--------------------------------------------------------------------------
| Notification Message
|--------------------------------------------------------------------------
*/

export const isValidMessage =
    (
        message?: string
    ): boolean => {
        if (!message) {
            return false;
        }

        return (
            message.trim().length >=
            2 &&
            message.trim().length <=
            500
        );
    };

/*
|--------------------------------------------------------------------------
| Location Name
|--------------------------------------------------------------------------
*/

export const isValidLocationName =
    (
        location?: string
    ): boolean => {
        if (!location) {
            return false;
        }

        return (
            location.trim().length >=
            2
        );
    };

/*
|--------------------------------------------------------------------------
| UUID Validation
|--------------------------------------------------------------------------
*/

export const isValidUuid =
    (
        value?: string
    ): boolean => {
        if (!value) {
            return false;
        }

        const regex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        return regex.test(value);
    };

/*
|--------------------------------------------------------------------------
| Array Validation
|--------------------------------------------------------------------------
*/

export const isNonEmptyArray =
    <T>(
        value?: T[]
    ): boolean => {
        return (
            Array.isArray(value) &&
            value.length > 0
        );
    };

/*
|--------------------------------------------------------------------------
| Safe JSON Parse
|--------------------------------------------------------------------------
*/

export const safeJsonParse =
    <T>(
        value: string,
        fallback: T
    ): T => {
        try {
            return JSON.parse(
                value
            ) as T;
        } catch {
            return fallback;
        }
    };

/*
|--------------------------------------------------------------------------
| String Length
|--------------------------------------------------------------------------
*/

export const validateLength =
    (
        value: string,
        min: number,
        max: number
    ): boolean => {
        const trimmed =
            value.trim();

        return (
            trimmed.length >=
            min &&
            trimmed.length <=
            max
        );
    };