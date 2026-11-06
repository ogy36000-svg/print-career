import {spawn,execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile,open,access} from 'node:fs/promises';
import path from 'node:path';import net from 'node:net';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),runtime=path.join(root,'.runtime');
const bin=path.join(root,'node_modules/next/dist/bin/next'),url='http://127.0.0.1:3000';
await mkdir(runtime,{recursive:true});
async function healthy(){try{const response=await fetch(url,{signal:AbortSignal.timeout(4000)});return response.ok&&(await response.text()).includes('<title>职景')}catch{return false}}
async function busy(){return new Promise(resolve=>{const socket=net.connect(3000,'127.0.0.1');socket.once('connect',()=>{socket.destroy();resolve(true)});socket.once('error',()=>resolve(false));socket.setTimeout(1000,()=>{socket.destroy();resolve(false)})})}
if(process.argv.includes('--stop')){
 try{const pid=Number(await readFile(path.join(runtime,'server.pid'),'utf8'));if(!Number.isSafeInteger(pid)||pid<=0)throw Error('Invalid PID');const encoded=execFileSync('powershell.exe',['-NoProfile','-Command',`[Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes([string](Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}').CommandLine))`],{encoding:'ascii',windowsHide:true});const command=Buffer.from(encoded.trim(),'base64').toString('utf16le').replaceAll('\\','/').toLowerCase();if(!command.includes(bin.replaceAll('\\','/').toLowerCase()))throw Error('Identity changed');execFileSync('taskkill.exe',['/PID',String(pid),'/T','/F'],{windowsHide:true,stdio:'pipe'});console.log('已停止本项目服务，数据保留。')}catch{console.log('停止未完成：没有可确认的本项目服务，或系统拒绝停止。请查看端口状态。')}
 process.exit(0);
}
if(!await healthy()){
 if(await busy())throw Error('3000端口被其他服务占用，未关闭它。日志：'+runtime);
 try{await access(bin)}catch{
  console.log('首次启动：正在安装锁定版本依赖，请等待。');
  await new Promise((resolve,reject)=>{const child=spawn('cmd.exe',['/d','/c','npm ci'],{cwd:root,windowsHide:true,stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('依赖安装失败，请查看上方信息。')))})
 }
 const out=await open(path.join(runtime,'server.log'),'a'),err=await open(path.join(runtime,'server-error.log'),'a');
 const child=spawn(process.execPath,[bin,'dev','--hostname','127.0.0.1','--port','3000'],{cwd:root,env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},detached:true,windowsHide:true,stdio:['ignore',out.fd,err.fd]});child.unref();await out.close();await err.close();await writeFile(path.join(runtime,'server.pid'),String(child.pid));
 console.log('正在启动完整Next服务并等待页面就绪。日志：'+runtime);
 const end=Date.now()+120000;while(Date.now()<end){if(await healthy())break;await new Promise(r=>setTimeout(r,700))}
 if(!await healthy())throw Error('页面尚未就绪，请查看日志，不要连续启动多个实例。');
}else console.log('复用已经就绪的职景网站。');
console.log('就绪：'+url+'；本机开发服务，云端服务使用正式网址。');
if(!process.argv.includes('--no-browser')){const browser=spawn('explorer.exe',[url],{detached:true,windowsHide:true,stdio:'ignore'});browser.unref()}
