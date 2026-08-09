import { NextRequest, NextResponse } from "next/server";
import {
  GithubRepo,
  parseReadmeSections,
  extractReadmeImages,
} from "../../lib/github";

const CACHE_DURATION = 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  const username =
    request.nextUrl.searchParams.get("username") || "riadswebdev";
  const perPage = 30;
  const token =
    process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "riadswebdev-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token?.trim()) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  }

  const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}`;
  const controller = new AbortController();
  const signal = controller.signal;

  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { headers, signal });
    if (response.status === 401) {
      return NextResponse.json(
        {
          error:
            "GitHub API authentication failed. The configured GITHUB_TOKEN is invalid, expired, or missing. Update the server-side token in .env.local.",
        },
        { status: 401 },
      );
    }
    if (response.status === 403) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit exceeded or the token is invalid. Set a valid server-side GITHUB_TOKEN and retry.",
        },
        { status: 503 },
      );
    }
    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub API returned status ${response.status}` },
        { status: response.status },
      );
    }

    const data = (await response.json()) as any[];
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "GitHub API response was not a repository array." },
        { status: 502 },
      );
    }
    const nonForkRepos = data.filter((repo) => !repo.fork);

    const enrichedRepos = await Promise.all(
      nonForkRepos.map(async (repo) => {
        let readmeContent: string | null = null;
        let imagesInReadme: string[] = [];
        let bannerUrl: string | null = null;

        try {
          const readmeRes = await fetch(
            `https://api.github.com/repos/${repo.full_name}/readme`,
            { headers, signal },
          );
          if (readmeRes.ok) {
            const readmeJson = await readmeRes.json();
            if (readmeJson.content) {
              readmeContent = Buffer.from(
                readmeJson.content,
                "base64",
              ).toString("utf8");
            }
          }
        } catch (err) {
          console.warn(
            `GitHub readme fetch failed for ${repo.full_name}:`,
            err,
          );
        }

        if (readmeContent) {
          const imageResults = extractReadmeImages(
            readmeContent,
            repo.full_name,
            repo.default_branch || "main",
          );
          imagesInReadme = imageResults.imagesInReadme;
          bannerUrl = imageResults.bannerUrl;
        }

        const parsedData = parseReadmeSections(
          readmeContent || "",
          repo.topics || [],
          repo.language,
        );
        const description =
          parsedData.extractedOverview || repo.description || null;

        return {
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          html_url: repo.html_url,
          description,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language,
          topics: repo.topics || [],
          updated_at: repo.updated_at,
          bannerUrl,
          imagesInReadme,
          default_branch: repo.default_branch,
          techStack: parsedData.techStack,
          keyFeatures: parsedData.keyFeatures,
          liveUrl: parsedData.liveUrl || repo.html_url,
        } as GithubRepo;
      }),
    );

    const reposWithReadme = enrichedRepos.filter(
      (repo) =>
        repo.description ||
        repo.bannerUrl ||
        repo.liveUrl ||
        repo.techStack.frontend.length > 0 ||
        repo.techStack.backend.length > 0 ||
        repo.techStack.database.length > 0 ||
        repo.techStack.devTools.length > 0 ||
        repo.language,
    );

    const finalRepos =
      reposWithReadme.length > 0 ? reposWithReadme : enrichedRepos;
    const responseBody = JSON.stringify(finalRepos);
    const res = new NextResponse(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION}`,
      },
    });
    return res;
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json(
        { error: "GitHub request timed out." },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: err.message || "GitHub fetch failed." },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
