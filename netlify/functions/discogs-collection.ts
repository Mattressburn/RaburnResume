// deno-lint-ignore-file no-explicit-any
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

    // 1. Fetch first page to discover total pages
    console.log(`[Discogs] Fetching page 1 for ${username}...`);
    const first = await fetch(`${base}?per_page=${per_page}&page=1`, {
      headers: {
        Authorization: `Discogs token=${token}`,
        "User-Agent": ua,
      },
    });

    if (!first.ok) {
      const txt = await first.text();
      console.error(`[Discogs] Error fetching page 1: ${first.status} ${txt}`);
      return new Response(txt, { status: first.status });
    }

    const firstData = (await first.json()) as DiscogsCollectionPage;
    const pages = firstData.pagination.pages || 1;
    const all = [...firstData.releases];

    console.log(`[Discogs] Found ${pages} total pages.`);

    // 2. Fetch remaining pages in parallel batches
    if (pages > 1) {
      // Create list of pages to fetch: [2, 3, 4, ... total]
      const remainingPages = Array.from({ length: pages - 1 }, (_, i) => i + 2);

      // Helper to chop array into chunks (size 5 = 5 concurrent requests)
      const chunk = <T>(arr: T[], size: number): T[][] =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, i * size + size)
        );

      // Process batches
      for (const batch of chunk(remainingPages, 5)) {
        console.log(`[Discogs] Fetching batch: ${batch.join(", ")}`);

        const batchPromises = batch.map((p) =>
          fetch(`${base}?per_page=${per_page}&page=${p}`, {
            headers: { Authorization: `Discogs token=${token}`, "User-Agent": ua },
          }).then(async (res) => {
            if (!res.ok) throw new Error(`Failed page ${p}: ${res.status}`);
            return res.json() as Promise<DiscogsCollectionPage>;
          })
        );

        // Wait for all 5 pages to return
        const results = await Promise.all(batchPromises);
        results.forEach((data) => all.push(...data.releases));

        // Polite delay between bursts to respect 60 req/min limit
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // 3. Return optimized "Lite" data
    const lite = all.map((r) => ({
      id: r.id,
      instance_id: r.instance_id,
      basic_information: r.basic_information,
    }));

    return new Response(JSON.stringify(lite), {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=300" // Cache for 5 minutes
      },
    });

  } catch (err: any) {
    console.error("[Discogs] Server Error:", err);
    return new Response(err?.message || "Server error", { status: 500 });
  }
};