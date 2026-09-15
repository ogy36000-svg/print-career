/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS tooling deliberately uses require. */
const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const tests = readdirSync("tests").filter(f => f.endsWith(".test.ts")).map(f => `tests/${f}`);
const compile = spawnSync(process.execPath, ["node_modules/typescript/bin/tsc", "--outDir", ".test-build", "--module", "commonjs", "--esModuleInterop", "--resolveJsonModule", "--target", "ES2022", "--skipLibCheck", ...tests], {stdio: "inherit"});
if (compile.status !== 0) process.exit(compile.status || 1);
const result = spawnSync(process.execPath, ["--test", ...tests.map(f => `.test-build/${f.replace(/\.ts$/, ".js")}`)], {stdio: "inherit"});
process.exit(result.status || 0);
