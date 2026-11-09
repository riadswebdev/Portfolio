# Viewport Swarm Implementation Log

Last updated: 2026-11-10. This is a handoff, not a completion claim. The portfolio pages and production build are intact; foreground animation timing, full-document scroll completion, and final visual parity still need a valid foreground browser run.

## Repository state and preservation

- Repository: `riadswebdev/Portfolio`
- Branch: `main`
- HEAD: `c66e1b6` (`Merge pull request #3 from riadswebdev/feat/section-triggered-agent-workflow`)
- No commit, push, deployment, reset, or broad revert was performed. No staged changes were present.
- The worktree was already dirty before this continuation. It remains dirty: 865 tracked file changes are summarized by Git (including binary frame deletions), with no staged diff.
- Modified source/config includes `README.md`, `app/components/CustomCursor.tsx`, construction components/styles/tests/helpers, `app/layout.tsx`, `app/page.tsx`, project page/loading files, and `package.json`.
- Deleted tracked files include `FrameScrollAnimation.tsx`, `RiadSignature.tsx`, `signaturePaths.ts`, and the pre-existing deleted `prompt.md`. The latter was not restored.
- Removed frame assets: 446 files in `public/home-scroll-animation/`, 232 in `public/projectScrollAnimation/`, and 168 in `public/contactScrollAnimation/` (846 total). The directories are absent. The unrelated `BackgroundVideo` remains; it plays on intersection and is not scroll-time video scrubbing.
- Preserved untracked files include the user-provided prompt documents and prior Swarm demo, new route/cursor components, this log, the comparison matrix, and existing screenshots. No unrelated untracked content was removed.
- The existing development server on `localhost:3000` was left running.

## Current implementation

- Restored the existing portfolio homepage and metadata; kept the site’s dark background, content, routes, forms, and project data behavior. The homepage has a layout-neutral `<main>` landmark for target discovery.
- The construction engine mirrors the current header/main/footer DOM and styling, keeps real sources available for restoration, and gates work by actual viewport intersection. Targets below the fold are not scheduled. Off-screen active tasks release leases and retain elapsed progress.
- States are `INTRO_GATHER`, `FAN_OUT`, `VIEWPORT_BUILD`, `VIEWPORT_IDLE`, and `FLOCK`. Intro agents gather at the existing RIAD mark; active cursors require unique leases from a 24-identity pool. Worker demand uses task complexity and a decaying, per-scroll-target normalized velocity sample. Wheel input seeds window or nested-scroll samples before scroll events; velocity can add at most four workers, and the pool maximum remains 24.
- Component/media work uses a selection/measurement and reveal; text uses progressive fragments and a caret; repeated components use a master/copy placement and destination edits. Standalone `<hr>`/explicit line targets have line handling, but no independent path/line task was observed on the current portfolio routes. Existing component borders and icons are not turned into decorative line work.
- The worker cursor layer and custom pointer use a single arrow silhouette without a cursor halo or click ripple. Unassigned workers are hidden during construction; limited roaming is reserved for viewport idle/completion.
- Skip restores the live page. Replay rebuilds the inert mirror. The activity panel is hidden when no construction work is assigned.
- Section-specific frame-sequence scroll effects were removed; `FrameScrollAnimation.tsx` and their supporting image sequences are gone. Real portfolio content and the empty GitHub-project state were preserved.
- No dependencies were added. Workers are a deterministic visual simulation, not real AI/LLM agents.

## Reference research

See [VIEWPORT_SWARM_REFERENCE_COMPARISON.md](./VIEWPORT_SWARM_REFERENCE_COMPARISON.md) for the full evidence-labeled comparison matrix.

- **Original Swarm:** live page and published minified JS/CSS were inspected. The bundle is compiled output, not original authoring source; its repository was `486d72a278d70fc803f30fd56e760535736a6e85`. The bundle confirms task types, dependencies, viewport scheduling, velocity-sensitive tempo/recruitment, and flocking. No reuse license was established and no code was copied.
- **Swarm Rebuild:** public README, manifest, and selected `swarm.js` portions were inspected. README describes blueprinting, task types, copies/dependencies, scroll-aware recruitment, and top-down gates. It states there is no license; no code was copied.
- **Swarmline:** exact listing ID `dmdkcobhmapkdjcnogkhaklpkocnlmee` and version 1.0.1 were identified. The listing advertises boxes, typing, duplication, and return to the live page. No exact-title installed manifest or public source was found; internals remain unverified. The unrelated Python project of the same name was excluded.

## Validation completed in this continuation

- `npm run test:construction` — **14/14 passed**, including spatial scheduling, unique leases, viewport eligibility/dependencies, velocity-sensitive worker demand, and duration/progress tests.
- `npx tsc --noEmit` — passed.
- Targeted ESLint on `app/components/construction`, `CustomCursor.tsx`, `PortfolioRouteEffects.tsx`, page/layout, and project page/loading files — passed.
- `git diff --check` — passed.
- `npm run build` — passed on Next.js 16.2.12; static routes `/`, `/about`, `/skill`, `/project`, and `/contact` generated successfully; API routes compiled.
- Repo-wide `npm run lint -- app` — **fails on existing unrelated issues** in `app/api/contact/route.ts`, `app/api/github/route.ts`, and `app/components/GithubProjects.tsx` (explicit `any`, direct body-style mutation); it also reports existing warnings in `GithubProjects.tsx`, `Navbar.tsx`, and `SkillsOverview.tsx`. No error from the targeted changed files appeared.
- Browser route checks loaded `/`, `/about`, `/skill`, `/project`, and `/contact` at 1365×900 and 390×844, then used Skip. Each route rendered its existing title/content and a main landmark. `document.documentElement.scrollWidth` did not exceed `innerWidth` (desktop: 1357 or 1365 at 1365px; mobile: 382 or 390 at 390px).
- Contact form retained three required inputs, one required textarea, and an enabled submit button. Focusing the real, non-mirrored first input and pressing Tab focused the email input (`john@example.com`). The form was not submitted.
- `/project` still displayed `All(0)` and `No repositories found matching your filters.`; no project records were invented.
- Skip reported `BUILD 100%`, `WORK 0`, `SKIPPED`; the activity panel was absent. Replay returned to `INTRO_GATHER`. The source header/main were hidden during the replay intro; the footer was also hidden after its transition settled.
- A desktop Skip screenshot is available at `viewport-swarm-1365x768-skip.png`. Some other captures in `docs/` came from a hidden/throttled browser and are not reliable visual evidence: `viewport-swarm-1365x768-idle.png` is a partial build, and the 390px screenshot is blank. Do not treat those files or earlier 1440px captures as current parity proof.

## Foreground browser limitation and unresolved acceptance

- The managed browser reported `document.visibilityState === "hidden"` and `document.hasFocus() === false`; one diagnostic received only three animation frames in about two seconds. Its screenshot also disagreed with the accessible DOM after Skip. This environment throttles the requestAnimationFrame construction loop, so its elapsed time and captured intermediate states are not valid foreground measurements.
- The prior session reported 5.94s at 1365×768 and 5.66s at 1440×900 from fan-out to viewport idle. Those are historical measurements and were **not re-measured after the velocity wiring**. No current 5–7s result or 10s hard-limit pass is claimed.
- Full-document completion at the true bottom, unique worker assignment under a fast scroll, preservation/resumption of partial work, foreground idle/flock, and the two-dimensional 1440px layout still need a trustworthy visible-browser run.
- A direct Chrome Guest screenshot showed the original dark portfolio and simple arrow cursors, but the development-only Next.js badge overlapped the RIAD header mark. Verify the production build visually if possible; that dev badge is not production UI.

## Next actions for the next session

1. Use a foreground browser where the page is visible (`document.visibilityState === "visible"`); start at 1365×768 and 1440×900 and time fan-out through true viewport idle. Require 5–7 seconds normally and never over 10 seconds.
2. Verify active worker counts equal unique task leases, work is spread across the two-dimensional viewport, no below-fold task starts, and fast scrolling pauses/resumes without resetting progress. Visit every section through the true document bottom and confirm 100% only when all tasks are complete.
3. Capture fresh intro, active-build, viewport-idle, 390×844, and 1440×900 screenshots from that foreground run. Replace or clearly mark stale captures; do not claim parity from hidden-tab screenshots.
4. Re-check source/mirror handoff and Skip/Replay in the production browser, confirm the activity panel is absent when `WORK=0`, and retest form keyboard access without submission.
5. Preserve the existing dirty worktree and do not commit or deploy unless the user asks.
