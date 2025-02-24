importScripts("/Wireview/wiregasm.js");

const fetchBuffer = async (url) => {
  const response = await fetch(url);
  return await response.arrayBuffer();
};

let sharky = null;
let session = null;

loadWiregasm({
  locateFile: (path, prefix) => {
    console.log("locateFile", path, prefix);
    if (path.endsWith(".data")) return "/Wireview/wiregasm.data";
    if (path.endsWith(".wasm")) return "/Wireview/wiregasm.wasm";
    return prefix + path;
  },
})
  .then((result) => {
    result.init();
    sharky = result;
    postMessage({ type: "init", success: true });
  })
  .catch((error) => {
    console.log({ type: "init", error, success: false });
  });

const vecToArray = (vec) =>
  Array.from({ length: vec.size() }, (_, i) => vec.get(i));

const devectorize = (obj) => {
  if (obj === null) return null;

  if (obj?.constructor?.name?.startsWith("Vector"))
    // need to devectorize again because of nested Vectors
    obj = devectorize(vecToArray(obj));

  // check if iterable
  if (obj?.entries?.()?.[Symbol.iterator] === "function")
    for (const [i, item] of obj.entries()) obj[i] = devectorize(item);
  else if (typeof obj === "object")
    for (const [i, item] of Object.entries(obj)) obj[i] = devectorize(item);

  return obj;
};

self.addEventListener("message", ({ data }) => {
  console.log("ahoy, worker got a message", data);
  console.log(sharky);

  if (data.type === "frame") {
    const frame = devectorize(session.getFrame(data.number));
    return postMessage({
      id: data.id,
      frame,
    });
  }

  if (data.type === "frames") {
    const framesVec = session.getFrames(
      data.filter ?? "",
      data.skip ?? 0,
      data.limit ?? 0
    );
    const frames = devectorize(framesVec.frames);

    console.log(frames);
    return postMessage({
      id: data.id,
      frames,
    });
  }

  if (data.type === "check-filter") {
    return postMessage({
      id: data.id,
      result: sharky.checkFilter(data.filter),
    });
  }

  if (data.type === "columns") {
    return postMessage({
      id: data.id,
      columns: vecToArray(sharky.getColumns()),
    });
  }

  if (data.type === "open") {
    sharky.FS.mkdir("/work");
    sharky.FS.mount(sharky.WORKERFS, { files: [data.file] }, "/work");
    console.log("mounted");

    session = new sharky.DissectSession(`/work/${data.file.name}`);
    console.log("created session");

    const result = session.load();
    console.log("loaded", result);

    return postMessage({
      id: data.id,
      ...result,
    });
  }

  if (data.type === "close") {
    session?.delete();
    sharky.FS.unmount("/work");
    sharky.FS.rmdir("/work");
    return postMessage({
      id: data.id,
      success: true,
    });
  }
});
