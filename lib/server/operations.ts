import {createHash, timingSafeEqual} from "node:crypto";
import {researchInput} from "../career/research";
export function authorizedRefresh(header:string|null,secret:string|undefined) {
  if (!secret || secret.length<32 || !header?.startsWith("Bearer ")) return false;
  const hash=(text:string)=>createHash("sha256").update(text).digest();
  return timingSafeEqual(hash(header.slice(7)),hash(secret));
}
export function refreshMajors(config:string|undefined) {
  return (config ?? "印刷工程,制浆造纸,包装工程").split(",").map(s=>s.trim()).filter(Boolean).slice(0,3)
    .map(major=>researchInput({major,topic:"internship"}).major);
}
export async function readLimitedJson(request:Request,max=2048):Promise<unknown> {
  if (Number(request.headers.get("content-length"))>max) throw new Error("请求过大");
  const reader=request.body?.getReader();
  if (!reader) throw new Error("请求正文为空");
  const chunks:Uint8Array[]=[];let size=0;
  try {
    for (;;) {
      const {done,value}=await reader.read();
      if (done) break;
      size+=value.byteLength;
      if (size>max) {await reader.cancel();throw new Error("请求过大");}
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
