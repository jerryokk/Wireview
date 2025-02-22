importScripts("/wiregasm.js");

const fetchBuffer = async (url) => {
  const response = await fetch(url);
  return await response.arrayBuffer();
};

let sharky = null;

loadWiregasm({
  locateFile: (path, prefix) => {
    if (path.endsWith(".data")) return "/wiregasm.data";
    if (path.endsWith(".wasm")) return "/wiregasm.wasm";
    return prefix + path;
  },
})
  .then((result) => {
    result.init();
    sharky = result;
    postMessage({ type: "init", success: true });
  })
  .catch((e) => {
    console.log({ type: "init", error: e, success: false });
  });

const vecToArray = (vec) =>
  Array.from({ length: vec.size() }, (_, i) => vec.get(i));

self.addEventListener("message", ({ data }) => {
  console.log("ahoy, worker got a message", data);
  console.log(sharky);

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

    const sess = new sharky.DissectSession(`/work/${data.file.name}`);
    console.log("created session");

    const result = sess.load();
    console.log("loaded", result);

    return postMessage({
      id: data.id,
      ...result,
    });
  }
});
