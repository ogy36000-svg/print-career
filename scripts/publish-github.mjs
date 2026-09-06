// 通过 GitHub REST API 推送代码（适用于 github.com 被网络限制、但 api.github.com 可用的环境）
// 用法：node scripts/publish-github.mjs <token> [repo名] [提交信息]
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, sep } from "path";

const [token, repoName = "print-career", message = `update ${new Date().toISOString().slice(0, 16).replace("T", " ")}`] = process.argv.slice(2);
if (!token) {
  console.error("缺少 GitHub Token：node scripts/publish-github.mjs <token> [repo名] [提交信息]");
  process.exit(1);
}

const API = "https://api.github.com";
const ROOT = join(import.meta.dirname, "..");
const IGNORE = new Set(["node_modules", ".next", ".git", "out", ".vercel", "secrets.local.txt"]);
const IGNORE_EXT = [".log"];

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 422) {
    throw new Error(`${options.method || "GET"} ${path} → ${res.status}: ${body.message || JSON.stringify(body)}`);
  }
  return { status: res.status, body };
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (IGNORE.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (!IGNORE_EXT.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

const user = (await api("/user")).body;
console.log(`GitHub 用户：${user.login}`);

// 1. 确保仓库存在
const created = await api("/user/repos", {
  method: "POST",
  body: JSON.stringify({ name: repoName, private: false, description: "印向未来 · 数字印刷实习求职导航" }),
});
console.log(created.status === 201 ? `已创建仓库 ${user.login}/${repoName}` : `仓库已存在，直接更新`);

// 2. 空仓库需先用 Contents API 初始化，否则 Git Data API 会 409
let parentSha;
try {
  const ref = (await api(`/repos/${user.login}/${repoName}/git/ref/heads/main`)).body;
  parentSha = ref.object?.sha;
} catch {
  const readme = readFileSync(join(ROOT, "README.md"));
  await api(`/repos/${user.login}/${repoName}/contents/README.md`, {
    method: "PUT",
    body: JSON.stringify({ message: "init", content: readme.toString("base64") }),
  });
  const ref = (await api(`/repos/${user.login}/${repoName}/git/ref/heads/main`)).body;
  parentSha = ref.object?.sha;
  console.log("空仓库已初始化");
}

// 3. 上传所有文件为 blob
const files = walk(ROOT);
console.log(`共 ${files.length} 个文件待上传…`);
const tree = [];
for (const f of files) {
  const content = readFileSync(f);
  const blob = (
    await api(`/repos/${user.login}/${repoName}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: content.toString("base64"), encoding: "base64" }),
    })
  ).body;
  tree.push({
    path: relative(ROOT, f).split(sep).join("/"),
    mode: "100644",
    type: "blob",
    sha: blob.sha,
  });
}

// 4. 创建 tree → commit → 更新 main 分支
const newTree = (
  await api(`/repos/${user.login}/${repoName}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ tree }),
  })
).body;

const commit = (
  await api(`/repos/${user.login}/${repoName}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: newTree.sha,
      parents: parentSha ? [parentSha] : [],
    }),
  })
).body;

if (parentSha) {
  await api(`/repos/${user.login}/${repoName}/git/refs/heads/main`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
} else {
  await api(`/repos/${user.login}/${repoName}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: "refs/heads/main", sha: commit.sha }),
  });
}

console.log(`✅ 推送完成：https://github.com/${user.login}/${repoName} （commit ${commit.sha.slice(0, 7)}）`);
