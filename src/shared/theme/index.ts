// src/shared/theme/index.ts

import { colors } from "./colors";

import { spacing } from "./spacing";

import { typography } from "./typography";

/*
|--------------------------------------------------------------------------
| Theme
|--------------------------------------------------------------------------
|
| Unified design system export.
|
| This becomes the single source of truth for:
| - colors
| - spacing
| - typography
| - future dark mode
| - future responsive themes
|
*/

export const theme = {
    colors,

    spacing,

    typography,
} as const;

/*
|--------------------------------------------------------------------------
| Theme Type
|--------------------------------------------------------------------------
*/

export type AppTheme =
    typeof theme;

/*
|--------------------------------------------------------------------------
| Re-Exports
|--------------------------------------------------------------------------
*/

export {
    colors,

    spacing,

    typography,
};