export function xhr<Context = unknown>(
  args: Omit<
    GM.Request<Context>,
    "method" | "onload" | "onerror" | "ontimeout" | "onabort"
  > &
    Partial<Pick<GM.Request, "method">>,
): Promise<GM.Response<Context>> {
  console.log(args);
  return new Promise<GM.Response<Context>>((resolve, reject) =>
    GM.xmlHttpRequest({
      method: "GET",
      ...args,
      onload: resolve,
      onerror: reject,
      ontimeout: reject,
      onabort: reject,
    }),
  );
}
