import * as esbuild from "esbuild";
import { readFileSync } from "node:fs";

const version = JSON.parse(readFileSync("custom_components/ha_intercom/manifest.json", "utf8")).version;
const watch = process.argv.includes("--watch");

const options = {
  entryPoints: ["src/intercom-card.js"],
  bundle: true,
  minify: !watch,
  format: "esm",
  target: ["es2020"],
  outfile: "custom_components/ha_intercom/frontend/intercom-card.js",
  legalComments: "none",
  define: { __INTERCOM_VERSION__: JSON.stringify(version) },
  banner: { js: `/* intercom-card ${version} */` },
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("watching ...");
} else {
  await esbuild.build(options);
  console.log(`built intercom-card ${version}`);
}
