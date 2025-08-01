importScripts("https://wireview.github.io/wiregasm.js");

const fetchBuffer = async (url) => {
  const response = await fetch(url, {
    mode: 'cors',
    credentials: 'omit'
  });
  return await response.arrayBuffer();
};

let sharky = null;
let session = null;

loadWiregasm({
  locateFile: (path, prefix) => {
    console.log("locateFile", path, prefix);
    // 尝试先使用本地文件，如果本地不可用则使用远程文件
    if (path.endsWith(".data")) {
      try {
        return "/wiregasm.bmp"; // 本地路径
      } catch (e) {
        return "https://wireview.github.io/wiregasm.bmp"; // 远程备用路径
      }
    }
    if (path.endsWith(".wasm")) {
      try {
        return "/wiregasm.wasm"; // 本地路径
      } catch (e) {
        return "https://wireview.github.io/wiregasm.wasm"; // 远程备用路径
      }
    }
    return prefix + path;
  },
})
  .then((result) => {
    result.init();
    sharky = result;
    console.log(sharky);
    const columns = vecToArray(sharky.getColumns());
    postMessage({ type: "init", columns, success: true });
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

self.addEventListener("message", async ({ data }) => {
  console.debug("ahoy, worker got a message", data);

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

    return postMessage({
      id: data.id,
      frames,
    });
  }

  if (data.type === "find") {
    return postMessage({
      id: data.id,
      result: session.findFrame(data.params),
    });
  }

  if (data.type === "check-filter") {
    return postMessage({
      id: data.id,
      result: sharky.checkFilter(data.filter),
    });
  }

  if (data.type === "open") {
    const filePath = `/uploads/${data.file.name}`;
    const arrayBuffer = await data.file.arrayBuffer();
    sharky.FS.writeFile(filePath, new Uint8Array(arrayBuffer));

    session = new sharky.DissectSession(filePath);
    console.log("created session");

    const result = session.load();
    console.log("loaded", result);

    return postMessage({
      id: data.id,
      result,
    });
  }

  if (data.type === "close") {
    session?.delete();
    session = null;
    return postMessage({
      id: data.id,
      success: true,
    });
  }
});
