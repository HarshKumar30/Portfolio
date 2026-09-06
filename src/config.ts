// Single source of truth for live profile data.
// Fill in your usernames here — every live section reads from this file.
export const profiles = {
  githubUser: 'HarshKumar30',
  githubUrl: 'https://github.com/HarshKumar30',
  leetcodeUser: 'Harsh_Kumar_096',
  leetcodeUrl: 'https://leetcode.com/u/Harsh_Kumar_096/',
  gfgUser: 'hk4004qt5s',
  gfgUrl: 'https://www.geeksforgeeks.org/profile/hk4004qt5s',
} as const;

export const liveConfig = {
  /** How many repos to show in Projects. */
  repoCount: 6,
  /** localStorage cache lifetime for API responses. */
  cacheTtlMs: 6 * 60 * 60 * 1000,
  /** Per-request timeout. */
  fetchTimeoutMs: 8000,
} as const;
