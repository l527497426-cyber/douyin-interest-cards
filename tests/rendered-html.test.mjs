import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the interest cards landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>抖音兴趣卡｜抖音开放平台<\/title>/);
  assert.match(html, /把一个兴趣想法/);
  assert.match(html, /id="chapter-1"/);
  assert.match(html, /id="chapter-3"/);
  assert.match(html, /id="chapter-4"/);
  assert.match(html, /id="chapter-5"/);
  assert.match(html, /case-ui-gallery-banner-v7\.png/);
  assert.doesNotMatch(html, /liquid-tuner|blaze-tuner|spark-tuner/);
});

test("ships every runtime-critical visual asset", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const requiredAssets = [
    "hero-line-art-final-frames-v4.png",
    "case-ui-gallery-banner-v7.png",
    "case-ui-keyboard-banner-v5.png",
    "case-ui-f1-banner-v5.png",
    "case-ui-city-banner-v5.png",
    "tennis-action-panorama-v17.webp",
    "interest-movie-cinematic-v3.webp",
    "interest-game-cinematic-v2.webp",
    "interest-food-cinematic-v2.webp",
    "interest-travel-cinematic-v2.webp",
    "interest-pet-cinematic-v2.webp",
    "interest-reading-cinematic-v2.webp",
    "interest-citywalk-cinematic-v2.webp",
  ];

  await Promise.all(requiredAssets.map((asset) => access(new URL(`../public/assets/${asset}`, import.meta.url))));
  for (const asset of requiredAssets) assert.match(page, new RegExp(asset.replaceAll(".", "\\.")));
  await access(new URL("../public/assets/hero-frames-v4/frame-001.webp", import.meta.url));
  await access(new URL("../public/assets/hero-frames-v4/frame-193.webp", import.meta.url));
});
