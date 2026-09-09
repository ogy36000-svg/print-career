// 通过 GitHub REST API 把 out/ 部署到 gh-pages 分支（绕过 git push 网络限制）
// 用法：node scripts/deploy-pages.mjs <token>
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, sep } from "path";

const [token] = process.argv.slice(2);
if (!token) { console.error("缺少 token"); process.exit(1); }

const API = "https://api.github.com";
const ROOT = join(import.meta.dirname, "..", "out");
const REPO = "ogy36000-svg/print-career";
const BRANCH = "gh-pages";

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${options.method || "GET"} ${path} → ${res.status}: ${body.message || JSON.stringify(body)}`);
  return body;
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT);
console.log(`共 ${files.length} 个文件待上传…`);

const tree = [];
for (const f of files) {
  const content = readFileSync(f);
  const blob = await api(`/repos/${REPO}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: content.toString("base64"), encoding: "base64" }),
  });
  tree.push({ path: relative(ROOT, f).split(sep).join("/"), mode: "100644", type: "blob", sha: blob.sha });
}

const newTree = await api(`/repos/${REPO}/git/trees`, { method: "POST", body: JSON.stringify({ tree }) });
const ref = await api(`/repos/${REPO}/git/ref/heads/${BRANCH}`);
const commit = await api(`/repos/${REPO}/git/commits`, {
  method: "POST",
  body: JSON.stringify({ message: `deploy ${new Date().toISOString().slice(0, 16).replace("T", " ")}`, tree: newTree.sha, parents: [ref.object.sha] }),
});
await api(`/repos/${REPO}/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: true }) });
console.log(`✅ 已部署到 gh-pages（commit ${commit.sha.slice(0, 7)}），等 GitHub Pages 构建约1分钟`);
