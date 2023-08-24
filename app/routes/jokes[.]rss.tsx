import { LoaderFunction } from "@remix-run/node";
import { db } from "~/util/db.server";

export let loader: LoaderFunction = async ({ request }) => {
  let jokes = await db.joke.findMany({
    include: { jokester: { select: { username: true } } },
    orderBy: { created_at: "desc" },
    take: 100,
  });

  let host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  if (!host)
    throw new Error("Could not determine domain URL.");

  let protocol = host.includes("localhost") ? "http" : "https";
  let domain = `${protocol}://${host}`;
  let jokes_url = `${domain}/jokes`;

  let items = jokes.map((joke) => `
    <item>
      <title><![CDATA[${escape_c_data(joke.name)}]]></title>
      <description><![CDATA[A funny joke called ${escape_html(joke.name)}]]></description>
      <author><![CDATA[${escape_c_data(joke.jokester.username)}]]></author>
      <pubDate>${joke.created_at.toUTCString()}</pubDate>
      <link>${jokes_url}/${joke.id}</link>
      <guid>${jokes_url}/${joke.id}</guid>
    </item>
  `.trim());

  let rss_string = `
    <rss xmlns:blogChannel="${jokes_url}" version="2.0">
      <channel>
        <title>Remix Jokes</title>
        <link>${jokes_url}</link>
        <description>Some funny jokes</description>
        <language>en-us</language>
        <generator>Kody the Koala</generator>
        <ttl>40</ttl>
        ${items}
      </channel>
    </rss>
  `.trim();

  return new Response(rss_string, {
    headers: {
      "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
      "Content-Type": "application/xml",
      "Content-Length": String(Buffer.byteLength(rss_string)),
    },
  });
};

let escape_c_data = (s: string) =>
  s.replace(/\]\]>/g, "]]]]><![CDATA[>");

let escape_html = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

