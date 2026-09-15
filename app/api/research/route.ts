import { researchInput } from "@/lib/career/research";
import { ResearchError, searchResearch } from "@/lib/server/research";
import { readLimitedJson } from "@/lib/server/operations";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (request.headers.get("content-length") && Number(request.headers.get("content-length")) > 2048) return Response.json({error:"请求过大"},{status:413});
  let input;
  try {
    input = researchInput(await readLimitedJson(request));
  } catch (error) {return Response.json({error:error instanceof Error ? error.message : "请求格式错误"},{status:error instanceof Error && error.message === "请求过大" ? 413 : 400});}
  try {return Response.json(await searchResearch(input,request),{headers:{"Cache-Control":"no-store"}});}
  catch (error) {return Response.json({error:error instanceof ResearchError ? error.message : "研究服务暂不可用"},{status:error instanceof ResearchError ? error.status : 500});}
}
