// Shared by scripts/changelog.mjs (plain node, so no TypeScript) and its test.

// Housekeeping subjects: ignore rules, noqa, lint and format passes, typos, version bumps, merges
const CHORE = /\b(?:ignor(?:e|es|ed|ing)|noqa|lint(?:s|ed|er|ing)?|format(?:s|ted|ting)?|typos?|bump(?:s|ed|ing)?|merg(?:e|es|ed|ing))\b/i;

/** True for a commit subject that is housekeeping rather than a product change */
export function isChoreCommit(subject) {
  return CHORE.test(subject);
}
