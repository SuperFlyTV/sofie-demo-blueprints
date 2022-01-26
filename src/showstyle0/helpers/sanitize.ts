/**
 * Sanitizes the names of "things" by removing whitespace and replacing dashes with underscores.
 *  This function does not attempt to strip other punctiuation (e.g. comma, period, colon, etc.)
 *  This function will not attempt to remove "non-word characters" (e.g. ø) as defined by the JS regex parser
 * @param name
 */
export function sanitizeName(name: string) {
	name.replace(/\w/g, '').replace(/-/g, '_')
}
