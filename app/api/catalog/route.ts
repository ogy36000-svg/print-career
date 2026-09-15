import { loadCatalog } from "@/lib/server/catalog";
export const dynamic = "force-dynamic";
export async function GET(request:Request) {
  const force=new URL(request.url).searchParams.get("refresh")==="1";
  return Response.json(await loadCatalog(force),{headers:{"Cache-Control":"no-store"}});
}
