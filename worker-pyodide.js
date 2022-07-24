importScripts('./pyodide/pyodide.js');

async function load() {
  const pyodide = await loadPyodide({
    indexURL: location.href.slice(0, location.href.length - '/worker-pyodide.js'.length) + '/pyodide',
  });
  await pyodide.loadPackage('numpy');
  await pyodide.runPython(`
import io, sys, traceback

def __run(code, input):
    my_in = io.StringIO(input)
    my_out = io.StringIO()
    my_err = io.StringIO()
    oldin = sys.stdin
    oldout = sys.stdout
    olderr = sys.stderr
    sys.stdin = my_in
    sys.stdout = my_out
    sys.stderr = my_err
    try:
        exec(code, {})
    except:
        traceback.print_exc()
    sys.stdin = oldin
    sys.stdout = oldout
    sys.stderr = olderr
    return [my_out.getvalue(), my_err.getvalue()]`);
  self.postMessage('ready');
  return pyodide;
}
const pyodideReadyPromise = load();

async function run(source, input) {
  const pyodide = await pyodideReadyPromise;
  try {
    pyodide.globals.set('__code_to_run', source);
    pyodide.globals.set('__input_to_read', input.replaceAll(/\r/g, ''));
    const [output, error] = await pyodide.runPython('__run(__code_to_run, __input_to_read)').toJs({});
    self.postMessage([output, error]);
  } catch (err) {
    console.log(err);
    self.postMessage(['PyTry 内部でエラーが発生しました', '']);
  }
}

self.addEventListener('message', (msg) => {
  run(msg.data[0], msg.data[1]);
});