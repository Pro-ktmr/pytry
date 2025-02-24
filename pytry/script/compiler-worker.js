importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.0/full/pyodide.js");

const pyodideReadyPromise = initialize();

async function initialize() {
  let pyodide;
  while (true) {
    try {
      pyodide = await loadPyodide({
        indexURL: new URL(
          "https://cdn.jsdelivr.net/pyodide/v0.21.0/full",
          location.href,
        ).toString(),
      });
      break;
    } catch (e) {}
  }

  pyodide.runPython(await (await fetch("./py/compiler-initialize.py")).text());

  return pyodide;
}

async function compile(source, mode) {
  const pyodide = await pyodideReadyPromise;
  try {
    pyodide.FS.writeFile("/source.py", source, { encoding: "utf8" });
    let res = await pyodide.runPython(`compile_code()`);
    res = res.replaceAll(
      /Traceback \(most recent call last\):\n[\s\S]*  File "\/source.py", line (\d*).*\n/g,
      `Traceback (most recent call last):
  File "Main.py", line $1
`,
    );
    self.postMessage({
      error: res,
      mode: mode,
    });
  } catch (e) {
    console.log(e);
  }
}

self.addEventListener("message", (message) => {
  compile(message.data.source, message.data.mode);
});
