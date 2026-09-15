import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeUserData, privateStorageKey, canSyncToCloud } from "../lib/profile-data";
test("旧档案缺少字段时深层补齐，不接受损坏技能数组",()=> {
  const data=normalizeUserData({profile:{name:"用户",skills:"bad"},favorites:[]});
  assert.equal(data.profile.name,"用户");assert.deepEqual(data.profile.skills,[]);assert.deepEqual(data.taskDone,[]);
});
test("不同账号缓存隔离且登录不自动上传游客资料",()=> {
  assert.notEqual(privateStorageKey("a"),privateStorageKey("b"));
  assert.notEqual(privateStorageKey(null),privateStorageKey("a"));
  assert.equal(canSyncToCloud("a",false,"a"),false);
  assert.equal(canSyncToCloud("a",true,"b"),false);
  assert.equal(canSyncToCloud("a",true,"a"),true);
  assert.equal(canSyncToCloud(null,true,null),false);
});
