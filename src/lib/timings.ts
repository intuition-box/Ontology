/**
 * Central registry of timing constants so the origin of each delay is
 * documented and tunable in one place rather than scattered across the
 * codebase as magic numbers.
 *
 * Each value pairs with its rationale — change the constant, not the call
 * site.
 */

/** Debounce for the global search input before fanning out to panels. */
export const GLOBAL_SEARCH_DEBOUNCE_MS = 200;

/** Debounce for the subject-input classifier — matches search debounce. */
export const SUBJECT_CLASSIFY_DEBOUNCE_MS = 200;

/**
 * Delay before opening the tutorial after app load, giving the initial
 * paint + route hydration time to settle so the highlight targets the
 * right DOM nodes.
 */
export const TUTORIAL_AUTOSHOW_DELAY_MS = 800;

/**
 * Delay between navigating to a route and opening the tutorial — covers
 * React Router's transition before we start scrolling into targets.
 */
export const TUTORIAL_ROUTE_SETTLE_MS = 100;

/**
 * Delay between `scrollIntoView` and measuring the target rect — smooth
 * scroll takes ~300ms in Chrome; 400ms is a comfortable buffer.
 */
export const TUTORIAL_SCROLL_SETTLE_MS = 400;

/** D3 zoom reset transition duration (matches the tree and graph resets). */
export const D3_RESET_DURATION_MS = 400;

/** "Copied!" confirmation feedback display duration in batch export buttons. */
export const COPY_FEEDBACK_MS = 2000;
