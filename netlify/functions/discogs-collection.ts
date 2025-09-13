// deno-lint-ignore-file no-explicit-any
// If your Netlify runtime is Node 18+, fetch is built-in. For older, add 'node-fetch'.
// Path: netlify/functions/discogs-collection.ts

type DiscogsCollectionPage = {
  pagination: { page: number; pages: number; per_page: number; items: number };
  releases: {
    id: number;
    instance_id: number;
    folder_id: number;
    basic_information: {
      title: string;
      year?: number;
      labels?: { name: string }[];
      formats?: { name?: string; descriptions?: string[] }[];
      artists?: { name: string }[];
    };
  }[];
};

export default async (req: Request) => {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");
    const token = process.env.DISCOGS_TOKEN;

    if (!username) return new Response("Missing ?username=", { status: 400 });
    if (!token) return new Response("Missing DISCOGS_TOKEN env var", { status: 500 });

    const ua = "HireRaburn-VinylDashboard/1.0 (+https://www.hireraburn.com)";
    const base = `https://api.discogs.com/users/${encodeURIComponent(username)}/collection/folders/0/releases`;
    const per_page = 100;

    // first page to discover total pages
    const first = await fetch(`${base}?per_page=${per_page}&page=1`, {
      headers: {
        Authorization: `Discogs token=${token}`,
        "User-Agent": ua,
      },
    });
    if (!first.ok) return new Response(await first.text(), { status: first.status });

    const firstData = (await first.json()) as DiscogsCollectionPage;
    const pages = firstData.pagination.pages || 1;

    const all = [...firstData.releases];

    // fetch remaining pages; Discogs auth limit ~60 req/min — stay polite
    for (let p = 2; p <= pages; p++) {
      const resp = await fetch(`${base}?per_page=${per_page}&page=${p}`, {
        headers: { Authorization: `Discogs token=${token}`, "User-Agent": ua },
      });
      if (!resp.ok) {
        // partial success is better than total failure
        break;
      }
      const data = (await resp.json()) as DiscogsCollectionPage;
      all.push(...data.releases);

      // tiny delay to avoid hammering
      await new Promise((r) => setTimeout(r, 900));
    }

    // Return only what the front-end needs
    const lite = all.map((r) => ({
      id: r.id,
      instance_id: r.instance_id,
      basic_information: r.basic_information,
    }));

    return new Response(JSON.stringify(lite), {
      headers: { "content-type": "application/json", "cache-control": "max-age=300" }, // 5 min CDN cache
    });
  } catch (err: any) {
    return new Response(err?.message || "Server error", { status: 500 });
  }
};
