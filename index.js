/**
 * Host half of the liquid-glass bundle. The visual layer lives entirely in the
 * Client module (`client.js`), which injects the stylesheet into the page and
 * gates it behind the `data-liquid-glass` attribute on `<html>`.
 *
 * Nothing on the Host side is needed: the theme reads only CSS already present
 * in the running page, keeps no state, and makes no requests.
 */
export function apply() {}
