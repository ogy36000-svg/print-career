import {test} from "node:test";
import assert from "node:assert/strict";
import {buildBackupCatalog,asLegacyCompany} from "../lib/career/backup";
import {authorizedRefresh, readLimitedJson, refreshMajors} from "../lib/server/operations";
test("企业备份保留真实历史企业，但不制造在招职位",()=>{
  const c=buildBackupCatalog();
  assert.ok(c.employers.length>50);
  assert.equal(c.vacancies.length,0);
  assert.ok(!c.employers.some(e=>/（群体）|（方向）/.test(e.name)));
});
test("更新入口需要足够长的正确服务密钥",()=>{
  const secret="a".repeat(32);
  assert.equal(authorizedRefresh("Bearer "+secret,secret),true);
  assert.equal(authorizedRefresh("Bearer wrong",secret),false);
  assert.equal(authorizedRefresh(null,secret),false);
  assert.equal(authorizedRefresh("Bearer short","short"),false);
});
test("新目录详情不得混回旧岗位、设备、等级和排行",()=>{
  const employer=buildBackupCatalog().employers.find(e=>e.evidence.kind==="historical")!;
  const fresh=asLegacyCompany({...employer,name:"新名称",tags:["新技能"],rank:null,rankYear:undefined});
  assert.equal(fresh.name,"新名称");
  assert.deepEqual(fresh.skills,["新技能"]);
  assert.deepEqual(fresh.jobs,[]);
  assert.equal(fresh.equipment,undefined);
  assert.equal(fresh.rank2025,null);
  assert.equal(fresh.recommend,"B");
});
test("更新主题来自服务配置且每次最多三个专业",()=>{
  assert.deepEqual(refreshMajors("印刷工程,造纸,包装,软件"),["印刷工程","造纸","包装"]);
  assert.throws(()=>refreshMajors("a".repeat(81)));
});
test("无长度头的流式请求也受字节上限限制",async()=>{
  assert.deepEqual(await readLimitedJson(new Request("https://example.com",{method:"POST",body:'{"major":"印刷"}'})),{major:"印刷"});
  await assert.rejects(()=>readLimitedJson(new Request("https://example.com",{method:"POST",body:"x".repeat(2049)})),/请求过大/);
});
