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

export interface CuratedProject {
  /** Exact GitHub repo name. */
  repo: string;
  /** Card blurb (shown as-is when the API is down). */
  blurb: string;
  /** Tag pills under the blurb. */
  tags: string[];
  /** Live screenshot target override (defaults to repo homepage, then repo URL). */
  site?: string;
}

/** Hand-picked projects for the Work grid — edit names/blurbs freely. */
export const projects: CuratedProject[] = [
  {
    repo: 'Portfolio',
    blurb: 'Fully responsive single-page app showcasing projects, skills and background. Theme system, SEO best practices, CI/CD, reusable components, mobile-first layout.',
    tags: ['Astro', 'TypeScript', 'CI/CD', 'SEO'],
  },
  {
    repo: 'Task-Tracker',
    blurb: 'Full-stack task manager — Python backend with a dynamic JS frontend. Normalized schema, RESTful JSON API, drag-and-drop reorder, deadline highlighting.',
    tags: ['Python', 'Flask', 'SQLite', 'REST API'],
  },
  {
    repo: 'TerraTrust',
    blurb: 'Web platform concept with a focus on trust, transparency and clean user experience.',
    tags: ['JavaScript', 'Web'],
  },
  {
    repo: 'Ateller-A-Digital-Marketplace',
    blurb: 'Digital marketplace concept — listings, discovery and modern storefront UX.',
    tags: ['JavaScript', 'Web'],
  },
  {
    repo: 'Image-Segmentation-for-Self-Driving-Cars',
    blurb: 'Image segmentation experiments for self-driving perception pipelines.',
    tags: ['Python', 'ML', 'Computer Vision'],
  },
  {
    repo: 'kaggle-HousePrices',
    blurb: 'House-price regression on the classic Kaggle dataset — features, validation, ensembles.',
    tags: ['Python', 'Kaggle', 'ML'],
  },
];

export const liveConfig = {
  /** localStorage cache lifetime for API responses. */
  cacheTtlMs: 6 * 60 * 60 * 1000,
  /** Per-request timeout. */
  fetchTimeoutMs: 8000,
} as const;
