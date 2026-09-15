"use client";
import { useMemo } from "react";
import { useCareerCatalog } from "@/components/CareerProvider";
import { asLegacyCompany } from "./career/backup";
export function useRemoteData<T extends {updated:string}>(name:string,fallback:T):{data:T;remote:boolean} {
  const {catalog,mode}=useCareerCatalog();
  const data=useMemo(()=>{
    if(name==="companies") return {...fallback,updated:catalog.updated,companies:catalog.employers.map(asLegacyCompany)} as T;
    return fallback;
  },[catalog,name,fallback]);
  return {data,remote:name==="companies" && mode==="cloud"};
}
