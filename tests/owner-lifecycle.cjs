/* eslint-disable @typescript-eslint/no-require-imports -- Isolated real-React browser regression runner. */
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { createServer } = require("node:http");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const ts = require("typescript");
const { chromium } = require("../artifacts/browser-runtime/node_modules/playwright");

// Bundle the real components and React in memory. Only network/auth, animation,
// and unrelated context UI are substituted; the tested state/effects are real.
const sources = new Map();
const root = path.resolve(__dirname, "..");
const mocks = {
  "@/components/WorkspaceContext": "exports.__esModule=true;exports.default=()=>null;",
  "@/components/AccountPanel": "exports.__esModule=true;exports.default=()=>null;",
  "@/lib/career/engine": "exports.careerAdvice=()=>({roles:[]});",
  "./OnboardingGuide": "exports.trapDialogFocus=()=>{};",
  "framer-motion": `const React=require('react'); exports.MotionConfig=({children})=>children;
    exports.motion=new Proxy({}, {get:(_,tag)=>({children,initial,animate,whileInView,viewport,...props})=>React.createElement(tag,props,children)});`,
  "@/components/CareerProvider": `const {useUserData}=require('@/lib/store');
    exports.useCareerCatalog=()=>{const s=useUserData(); const profile=s.loaded?{major:'印尼语',grade:'3'}:null;
      return {profile,query:profile??{major:'',grade:''},catalog:{},workspace:{nextSteps:['下一步'],certificates:[],directions:[]}};};`,
  "./CareerProvider": "module.exports=require('@/components/CareerProvider');",
  "./supabase": `exports.getSupabase=()=>window.authFixture;`,
};
const entry = `const React=require('react'); const {createRoot}=require('react-dom/client');
  const {UserDataProvider,useUserData}=require('@/lib/store');
  const Profile=require('@/app/profile/page').default;
  const Letter=require('@/components/LetterWidget').default;
  const Fav=require('@/components/FavButton').default;
  const Status=require('@/components/CompanyStatus').default;
  let listener; const pending=new Map(); window.savedCallbacks=[];
  window.authFixture={auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:fn=>{listener=fn;return {data:{subscription:{unsubscribe(){}}}};},signOut:async()=>{}},
    from:()=>({select:()=>({eq:(_,id)=>({maybeSingle:()=>new Promise(resolve=>pending.set(id,resolve))})}),upsert:async()=>({error:null})})};
  window.switchOwner=id=>listener(id?'SIGNED_IN':'SIGNED_OUT',id?{user:{id}}:null);
  window.restoreOwner=(id,data)=>pending.get(id)({data:{data},error:null});
  function Probe(){const s=useUserData();window.store=s;return React.createElement('output',{id:'owner-state'},JSON.stringify({loaded:s.loaded,user:s.user?.id,data:s.data}));}
  function App(){return React.createElement(UserDataProvider,null,React.createElement(Probe),React.createElement('button',{id:'outside'},'外部焦点'),React.createElement(Letter),React.createElement(Fav,{companyId:'company',companyName:'测试企业'}),React.createElement(Status,{companyId:'company'}),React.createElement(Profile));}
  createRoot(document.getElementById('root')).render(React.createElement(App));`;
function collect(id, raw) {
  if (sources.has(id)) return;
  const relative = path.relative(root,id).replaceAll('\\','/');
  const baselineFiles = ['lib/store.tsx','app/profile/page.tsx','components/LetterWidget.tsx','components/FavButton.tsx','components/CompanyStatus.tsx'];
  const source = raw ?? (process.env.OWNER_REGRESSION_BASELINE && baselineFiles.includes(relative)
    ? execFileSync('git',['show',`${process.env.OWNER_REGRESSION_BASELINE}:${relative}`],{cwd:root,encoding:'utf8'}) : readFileSync(id, "utf8"));
  const code = id.endsWith('.json') ? `module.exports=${source};` : /\.[cm]?tsx?$/.test(id) ? ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText : source;
  const deps = {};
  sources.set(id, { code, deps });
  for (const [, name] of code.matchAll(/require\(["']([^"']+)["']\)/g)) {
    // PDF loading is not exercised; TXT still uses the actual parser.
    if (name === "pdfjs-dist") { deps[name] = "mock:pdf"; collect("mock:pdf", "module.exports={};"); continue; }
    if (Object.hasOwn(mocks, name)) {
      deps[name] = `mock:${name}`;
      collect(deps[name], mocks[name]);
    } else {
      let target = name.startsWith("@/") ? path.join(root, name.slice(2)) : name;
      if (name.startsWith(".")) target = path.resolve(path.dirname(id), name);
      if (path.isAbsolute(target)) target = [target,target+".ts",target+".tsx",target+".js"].find(existsSync) ?? target;
      deps[name] = require.resolve(target, { paths: [path.dirname(id.startsWith("mock:") ? path.join(root, "entry.js") : id)] });
      collect(deps[name]);
    }
  }
}
collect(path.join(root, "entry.js"), entry);
const bundle = `var process={env:{NODE_ENV:'development'}};const modules={${[...sources].map(([id,{code,deps}])=>`${JSON.stringify(id)}:[function(require,module,exports){${code}\n},${JSON.stringify(deps)}]`).join(",")}};const cache={};function load(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};const [fn,deps]=modules[id];fn(n=>load(deps[n]),m,m.exports);return m.exports;}load(${JSON.stringify(path.join(root,"entry.js"))});`;
new (require('node:vm').Script)(bundle);
const record = (name, marked = false) => ({ profile: { name, phone: "", email: "", skills: [name + "已有技能"] }, favorites: marked ? ["company"] : [], companyStatus: marked ? { company: "面试中" } : {}, updatedAt: "2026-09-18T00:00:00Z" });

async function run() {
  const server = createServer((req, res) => { res.setHeader("Content-Type", req.url === "/fixture.js" ? "text/javascript; charset=utf-8" : "text/html; charset=utf-8"); res.end(req.url === "/fixture.js" ? bundle : '<meta charset="utf-8"><div id="root"></div><script src="/fixture.js"></script>'); });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  let failures = 0;
  const cases = [
    ["completed resume preview and private skill draft cannot cross owners", async page => {
      await page.locator('input[aria-label="添加技能"]').fill("A私有草稿");
      await page.locator('#resume-upload').setInputFiles({name:"resume.txt",mimeType:"text/plain",buffer:Buffer.from("13812345678 owner-a@example.com CET-6")});
      await page.getByText("电话 13812345678", {exact:true}).waitFor();
      await page.evaluate(() => {window.savedCallbacks.push(window.store.update);window.switchOwner("B");});
      await page.waitForFunction(() => window.store.user?.id === "B" && !window.store.loaded);
      await page.evaluate(data => window.restoreOwner("B",data), record("B"));
      await page.getByPlaceholder("你的名字").waitFor();
      assert.equal(await page.getByText("电话 13812345678",{exact:true}).count(),0,"A completed preview remained in B");
      assert.equal(await page.locator('input[aria-label="添加技能"]').inputValue(),"","A private draft remained in B");
      await page.evaluate(() => window.savedCallbacks[0](d => ({...d,profile:{...d.profile,phone:"STALE"}})));
      assert.equal(await page.getByPlaceholder("手机",{exact:true}).inputValue(),"","A saved update callback edited B");
      assert.equal(await page.getByPlaceholder("你的名字").inputValue(),"B");
    }],
    ["pending local extraction cannot recreate previous owner preview", async page => {
      await page.evaluate(() => {File.prototype.text=function(){return new Promise(resolve=>window.finishExtraction=()=>resolve("13812345678 owner-a@example.com"));};});
      await page.locator('#resume-upload').setInputFiles({name:"pending.txt",mimeType:"text/plain",buffer:Buffer.from("delayed")});
      await page.getByText("正在本地识别…",{exact:true}).waitFor();
      await page.evaluate(() => window.switchOwner("B"));
      await page.waitForFunction(() => window.store.user?.id === "B" && !window.store.loaded);
      await page.evaluate(data => window.restoreOwner("B",data), record("B"));
      await page.getByPlaceholder("你的名字").waitFor();
      await page.evaluate(() => window.finishExtraction());
      await page.waitForTimeout(80);
      assert.equal(await page.getByText("电话 13812345678",{exact:true}).count(),0,"A delayed extraction populated B");
      assert.equal(await page.getByRole("button",{name:"一键填入档案"}).count(),0);
      assert.equal(await page.getByPlaceholder("手机",{exact:true}).inputValue(),"");
      await page.locator('#resume-upload').setInputFiles({name:"resume.txt",mimeType:"text/plain",buffer:Buffer.from("delayed")});
      await page.evaluate(() => window.finishExtraction());
      await page.getByRole("button",{name:"一键填入档案"}).click();
      assert.equal(await page.getByPlaceholder("手机",{exact:true}).inputValue(),"13812345678","current owner parser/apply stopped working");
      assert.ok((await page.evaluate(()=>window.store.data.profile.skills)).includes('B已有技能'),"resume import lost an existing skill");
    }],
    ["owner change while note is open restores scrolling, focus and reopening", async page => {
      await page.locator('#outside').focus();
      await page.getByRole("button",{name:"一张小笺 ↗"}).evaluate(node=>node.click());
      await page.waitForFunction(()=>document.querySelector('dialog')?.open);
      assert.equal(await page.evaluate(()=>document.body.style.overflow),"hidden");
      await page.evaluate(()=>window.switchOwner("B"));
      await page.waitForFunction(()=>window.store.user?.id==="B" && !window.store.loaded);
      assert.equal(await page.evaluate(()=>document.body.style.overflow),"","note removal kept body locked");
      assert.equal(await page.evaluate(()=>document.activeElement.id),"outside","focus was not restored");
      await page.evaluate(data=>window.restoreOwner("B",data),record("B"));
      await page.getByRole("button",{name:"一张小笺 ↗"}).click();
      await page.waitForFunction(()=>document.querySelector('dialog')?.open);
      await page.keyboard.press("Escape");
      await page.waitForFunction(()=>!document.querySelector('dialog')?.open);
      assert.equal(await page.evaluate(()=>document.body.style.overflow),"");
      assert.equal(await page.evaluate(()=>document.activeElement.className),"letter-trigger");
    }],
    ["delayed owner restore masks markers and rejects current and stale edits", async page => {
      assert.equal(await page.getByRole("button",{name:"取消收藏测试企业"}).getAttribute("aria-pressed"),"true");
      await page.evaluate(()=>{window.savedCallbacks.push(window.store.update);window.switchOwner("B");});
      await page.waitForFunction(()=>window.store.user?.id==="B" && !window.store.loaded);
      assert.equal(await page.getByRole("button",{name:"取消收藏测试企业"}).count(),0,"A favorite visible while B loads");
      assert.equal(await page.getByText("我的投递状态",{exact:false}).innerText().then(t=>t.includes("面试中")),false,"A status visible while B loads");
      assert.equal(await page.getByRole("button",{name:"收藏测试企业"}).isDisabled(),true);
      assert.equal(await page.getByRole("button",{name:"已投递",exact:true}).isDisabled(),true);
      await page.evaluate(()=>window.store.update(d=>({...d,favorites:['company']})));
      await page.waitForTimeout(40);
      assert.deepEqual(await page.evaluate(()=>window.store.data.favorites),[],"hydration edit was accepted");
      await page.evaluate(data=>window.restoreOwner("B",data),record("B"));
      await page.waitForFunction(()=>window.store.loaded);
      await page.evaluate(()=>window.savedCallbacks[0](d=>({...d,favorites:['company']})));
      await page.waitForTimeout(40);
      assert.deepEqual(await page.evaluate(()=>window.store.data.favorites),[],"stale A callback edited loaded B");
      await page.getByRole("button",{name:"收藏测试企业"}).click();
      assert.equal(await page.getByRole("button",{name:"取消收藏测试企业"}).getAttribute("aria-pressed"),"true");
      await page.getByRole("button",{name:"已投递",exact:true}).click();
      assert.equal(await page.evaluate(()=>window.store.data.companyStatus.company),"已投递");
    }],
    ["saved update callbacks reject B and later restored A sessions", async page => {
      await page.evaluate(()=>{window.savedCallbacks.push(window.store.update);window.switchOwner('B');});
      await page.waitForFunction(()=>window.store.user?.id==='B' && !window.store.loaded);
      await page.evaluate(data=>window.restoreOwner('B',data),record('B'));
      await page.waitForFunction(()=>window.store.loaded);
      await page.evaluate(()=>window.savedCallbacks[0](d=>({...d,profile:{...d.profile,name:'STALE'}})));
      await page.waitForTimeout(40);
      assert.equal(await page.getByPlaceholder('你的名字').inputValue(),'B','A callback changed loaded B');
      await page.evaluate(()=>window.switchOwner('A'));
      await page.waitForFunction(()=>window.store.user?.id==='A' && !window.store.loaded);
      await page.evaluate(data=>window.restoreOwner('A',data),{...record('A restored'),updatedAt:'2099-01-01T00:00:00Z'});
      await page.waitForFunction(()=>window.store.loaded);
      await page.evaluate(()=>window.savedCallbacks[0](d=>({...d,profile:{...d.profile,name:'STALE'}})));
      await page.waitForTimeout(40);
      assert.equal(await page.getByPlaceholder('你的名字').inputValue(),'A restored','old A callback changed a later A session');
    }],
    ["updates requested during hydration never run or persist", async page => {
      await page.evaluate(()=>window.switchOwner('B'));
      await page.waitForFunction(()=>window.store.user?.id==='B' && !window.store.loaded);
      await page.evaluate(()=>{window.hydrationUpdaterRan=false;window.store.update(d=>{window.hydrationUpdaterRan=true;return {...d,taskDone:['hydration-edit']};});});
      await page.waitForTimeout(40);
      assert.equal(await page.evaluate(()=>window.hydrationUpdaterRan),false,'hydration updater was accepted');
      await page.evaluate(data=>window.restoreOwner('B',data),record('B'));
      await page.waitForFunction(()=>window.store.loaded);
      assert.deepEqual(await page.evaluate(()=>window.store.data.taskDone),[]);
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('print-career:account:B')).taskDone),[]);
    }],
  ];
  try {
    for (const [name, check] of cases) {
      const page = await browser.newPage(); page.setDefaultTimeout(5000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
      try {
        await page.goto(`http://127.0.0.1:${server.address().port}`);
        await page.waitForFunction(()=>window.store?.loaded);
        await page.evaluate(()=>window.switchOwner("A"));
        await page.waitForFunction(()=>window.store.user?.id==="A" && !window.store.loaded);
        await page.evaluate(data=>window.restoreOwner("A",data),record("A",true));
        await page.getByPlaceholder("你的名字").waitFor();
        await check(page); assert.deepEqual(errors,[]);console.log(`PASS ${name}`);
      } catch(error) {failures++;console.error(`FAIL ${name}: ${error.message}`); if(errors.length)console.error(errors);}
      finally {await page.close();}
    }
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
  console.log(`${cases.length-failures}/${cases.length} owner lifecycle browser regressions passed`);
  process.exitCode=failures?1:0;
}
run().catch(error=>{console.error(error);process.exitCode=1;});
