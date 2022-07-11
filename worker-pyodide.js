importScripts('./pyodide/pyodide.js');

async function load() {
  let pyodide = await loadPyodide({
    indexURL: location.href.slice(0, location.href.length - '/worker-pyodide.js'.length) + '/pyodide',
  });
  await pyodide.loadPackage('numpy');
  await pyodide.runPython(`
import io, sys, traceback

def __run(code, input):
    my_in = io.StringIO(input)
    my_out = io.StringIO()
    oldin = sys.stdin
    oldout = sys.stdout
    olderr = sys.stderr
    sys.stdin = my_in
    sys.stdout = sys.stderr = my_out
    try:
        exec(code, {})
    except:
        traceback.print_exc()
    sys.stdin = oldin
    sys.stdout = oldout
    sys.stderr = olderr
    return my_out.getvalue()`);
  self.postMessage('ready');
  return pyodide;
}
let pyodideReadyPromise = load();

async function run(source, input) {
  let pyodide = await pyodideReadyPromise;
  try {
    pyodide.globals.set('__code_to_run', source);
    pyodide.globals.set('__input_to_read', input.replaceAll(/\r/g, ""));
    let output = await pyodide.runPython('__run(__code_to_run, __input_to_read)');
    output = output.replaceAll(/(.*)File "<exec>"(.*)\n/g, "");
    output = output.replaceAll(/(.*)File "<string>", line (\d*)(.*)\n/g, '$1File "Main.py", line $2$3\n');
    let formatedOutput = formatOutput(output);
    self.postMessage([formatedOutput, output]);
  } catch (err) {
    console.log(err);
    self.postMessage('PyTry 内部でエラーが発生しました');
  }
}

function formatOutput(output) {
  output = output.replaceAll('Traceback (most recent call last):\n', 'エラー発生:\n');
  output = output.replaceAll(/(.*)File "Main.py", line (\d*)(.*)\n/g, '$1プログラムの $2 行目\n');
  output = output.replaceAll('ZeroDivisionError: division by zero', 'ZeroDivisionError: ゼロで割ろうとしました\n');
  output = output.replaceAll(/NameError: name '(.*)' is not defined/g, "NameError: 「$1」が見つかりません\n");
  output = output.replaceAll('SyntaxError: invalid syntax', 'SyntaxError: 文法が間違っています\n');
  output = output.replaceAll('IndentationError: expected an indented block', 'IndentationError: インデントを忘れています\n');
  output = output.replaceAll('IndentationError: unexpected indent', 'IndentationError: インデントがおかしな位置にあります\n');
  output = output.replaceAll('IndentationError: unindent does not match any outer indentation level', 'IndentationError: インデントが揃っていません\n');
  output = output.replaceAll(/ValueError: invalid literal for int\(\) with base 10: '(.*)'/g, "ValueError: 「$1」を整数に変換できません (入力の受け取り方や入力欄が正しくないことがあります)\n");
  output = output.replaceAll(/ValueError: not enough values to unpack \(expected (.*), got (.*)\)/g, "ValueError: $2 個しかないデータを $1 個に分けようとしました (入力の受け取り方や入力欄が正しくないことがあります)\n");
  output = output.replaceAll(/ValueError: too many values to unpack \(expected (.*)\)/g, "ValueError: $1 個より多いデータを $1 個に分けようとしました (入力の受け取り方や入力欄が正しくないことがあります)\n");
  output = output.replaceAll('IndexError: list index out of range', 'IndexError: リストのサイズ以上の添え字の要素にアクセスしようとしました\n');
  output = output.replaceAll('IndexError: string index out of range', 'IndexError: 文字列の長さ以上の添え字の文字にアクセスしようとしました\n');
  output = output.replaceAll(/KeyError: '(.*)'/g, 'KeyError: キー「$1」は存在しません\n');
  output = output.replaceAll('EOFError: EOF when reading a line', 'EOFError: ファイルの末尾に到達しました (入力欄が正しくないことがあります)\n');
  return output;
}

self.addEventListener('message', (msg) => {
  run(msg.data[0], msg.data[1]);
});
