// Per-account serialization prevents a slow older upsert overwriting a newer one.
export function createWriteQueue() {
  const tails=new Map<string,Promise<unknown>>();
  return function enqueue<T>(owner:string,write:()=>Promise<T>):Promise<T>{
    const previous=tails.get(owner) ?? Promise.resolve();
    const next=previous.catch(()=>undefined).then(write);
    tails.set(owner,next);
    const cleanup=()=>{if(tails.get(owner)===next) tails.delete(owner);};
    void next.then(cleanup,cleanup);
    return next;
  };
}
