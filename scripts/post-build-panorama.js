const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const DOTA_ROOT = process.env.DOTA2_ROOT || "C:\\Program Files (x86)\\Steam\\steamapps\\common\\dota 2 beta";
const RESOURCE_COMPILER = path.join(DOTA_ROOT, "game", "bin", "win64", "resourcecompiler.exe");
const PANORAMA_CONTENT_DIR = path.join(
  DOTA_ROOT,
  "content",
  "dota_addons",
  "A1",
  "panorama"
);
const PANORAMA_SCRIPTS_DIR = path.join(PANORAMA_CONTENT_DIR, "scripts", "custom_game");
const PANORAMA_GAME_DIR = path.join(
  DOTA_ROOT,
  "game",
  "dota_addons",
  "A1",
  "panorama"
);

function getJavaScriptResources(dir) {
  const resources = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      resources.push(...getJavaScriptResources(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      resources.push(entryPath);
    }
  }
  return resources;
}

function pruneStaleCompiledLayoutsAndStyles(contentDir, gameDir) {
  if (!fs.existsSync(gameDir)) return;
  for (const entry of fs.readdirSync(gameDir, { withFileTypes: true })) {
    const compiledPath = path.join(gameDir, entry.name);
    if (entry.isDirectory()) {
      pruneStaleCompiledLayoutsAndStyles(path.join(contentDir, entry.name), compiledPath);
      continue;
    }
    if (!entry.isFile()) continue;
    let sourceName = null;
    if (entry.name.endsWith(".vxml_c")) sourceName = entry.name.replace(/\.vxml_c$/, ".xml");
    else if (entry.name.endsWith(".vcss_c")) sourceName = entry.name.replace(/\.vcss_c$/, ".css");
    if (!sourceName) continue;
    const sourcePath = path.join(contentDir, sourceName);
    if (!fs.existsSync(sourcePath)) continue;
    const sourceMtime = fs.statSync(sourcePath).mtimeMs;
    const compiledMtime = fs.statSync(compiledPath).mtimeMs;
    if (sourceMtime > compiledMtime) {
      fs.unlinkSync(compiledPath);
      console.log(`Removed stale ${path.relative(gameDir, compiledPath)} (source newer); Dota tools will recompile on next launch.`);
    }
  }
}

if (!fs.existsSync(RESOURCE_COMPILER)) {
  throw new Error(`resourcecompiler.exe not found: ${RESOURCE_COMPILER}`);
}

if (!fs.existsSync(PANORAMA_SCRIPTS_DIR)) {
  throw new Error(`Panorama scripts directory not found: ${PANORAMA_SCRIPTS_DIR}`);
}

pruneStaleCompiledLayoutsAndStyles(PANORAMA_CONTENT_DIR, PANORAMA_GAME_DIR);

const resources = getJavaScriptResources(PANORAMA_SCRIPTS_DIR);
if (resources.length === 0) {
  console.log("No Panorama JavaScript resources found, skipping resource compile.");
  process.exit(0);
}

console.log(`Compiling ${resources.length} Panorama script resource(s) with resourcecompiler...`);

const result = spawnSync(
  RESOURCE_COMPILER,
  ["-f", "-novpk", ...resources],
  {
    stdio: "inherit",
  }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Panorama resource compile complete.");

