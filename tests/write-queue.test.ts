import {test} from "node:test";
import assert from "node:assert/strict";
import {createWriteQueue} from "../lib/write-queue";
test("同账号旧写入必须结束后才开始新写入，不同账号不互相阻塞",async()=>{
  const queue=createWriteQueue();
  const events:string[]=[];
  let release!:()=>void;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  const old=queue("A",async()=>{events.push("old-start");await gate;events.push("old-end");});
  const fresh=queue("A",async()=>{events.push("new");});
  const other=queue("B",async()=>{events.push("B");});
  await other;
  assert.ok(!events.includes("new"));
  release();await Promise.all([old,fresh]);
  assert.ok(events.indexOf("old-end")<events.indexOf("new"));
});
test("旧写入失败不能阻断后续保存",async()=>{
  const queue=createWriteQueue();
  await assert.rejects(queue("A",async()=>{throw new Error("failed");}));
  assert.equal(await queue("A",async()=>42),42);
});
