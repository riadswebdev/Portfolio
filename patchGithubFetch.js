const fs = require("fs");
const p = "d:/portfolio/app/components/GithubProjects.tsx";
let text = fs.readFileSync(p, "utf8");
const startMarker = `  useEffect(() => {
    async function fetchReposAndDetails() {`;
const endMarker = `    fetchReposAndDetails();
  }, [username]);`;
const start = text.indexOf(startMarker);
const end = text.indexOf(endMarker, start);
if (start < 0 || end < 0) {
  console.error("Markers not found", start, end);
  process.exit(1);
}
const endInclusive = end + endMarker.length;
const newBlock = `  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const loadGithubRepos = async () => {
      const cacheKey = username;
      const cached = repoCache.get(cacheKey);
      if (cached) {
        setRepos(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!repoFetchPromises.has(cacheKey)) {
          const promise = (async () => {
            const response = await fetch(`/api/github?username=${encodeURIComponent(username)}`, {
              signal: abortController.signal,
            });

            if (!response.ok) {
              const body = await response.json().catch(() => null);
              const message = body?.error || `GitHub API returned status ${response.status}`;
              throw new Error(message);
            }

            const data = (await response.json()) as GithubRepo[];
            repoCache.set(cacheKey, data);
            return data;
          })();

          repoFetchPromises.set(cacheKey, promise);
        }

        const data = await repoFetchPromises.get(cacheKey)!;
        setRepos(data);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load GitHub repositories.");
      } finally {
        setLoading(false);
      }
    };

    loadGithubRepos();
    return () => {
      abortController.abort();
    };
  }, [username]);`;
text = text.slice(0, start) + newBlock + text.slice(endInclusive);
fs.writeFileSync(p, text, "utf8");
console.log("patched");
