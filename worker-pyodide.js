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
  // 基本
  output = output.replaceAll('Traceback (most recent call last):\n', 'エラー発生:\n');
  output = output.replaceAll(/(.*)File "Main.py", line (\d*)(.*)\n/g, '$1プログラムの $2 行目\n');
  
  // インデント
  output = output.replaceAll('IndentationError: expected an indented block', 'インデントエラー: インデントを忘れています\n');
  output = output.replaceAll('IndentationError: unexpected indent', 'インデントエラー: インデントがおかしな位置にあります\n');
  output = output.replaceAll('IndentationError: unindent does not match any outer indentation level', 'インデントエラー: インデントが揃っていません\n');
  output = output.replaceAll('SyntaxError: invalid non-printable character U+3000', '文法エラー: 全角スペースが紛れ込んでいます (半角スペース 2 個に直しましょう)\n');
  
  // 入出力
  output = output.replaceAll(/ValueError: invalid literal for int\(\) with base 10: '(.*)'/g, "値エラー: 「$1」を整数に変換できません (入力の受け取り方や入力欄が正しくないことがあります)\n");
  output = output.replaceAll(/ValueError: not enough values to unpack \(expected (.*), got (.*)\)/g, "値エラー: $2 個しかないデータを $1 個に分けようとしました (入力の受け取り方や入力欄が正しくないことがあります)\n");
  output = output.replaceAll(/ValueError: too many values to unpack \(expected (.*)\)/g, "値エラー: $1 個より多いデータを $1 個に分けようとしました (入力の受け取り方や入力欄が正しくないことがあります)\n");
  output = output.replaceAll('EOFError: EOF when reading a line', 'ファイル末尾エラー: ファイルの末尾に到達しました (入力の受け取り方や入力欄が正しくないことがあります)\n');
  
  // 存在しない
  output = output.replaceAll(/NameError: name '(.*)' is not defined/g, "名前エラー: 「$1」が見つかりません\n");
  output = output.replaceAll('IndexError: string index out of range', '添え字エラー: 文字列の長さ以上の添え字の文字にアクセスしようとしました\n');
  output = output.replaceAll('IndexError: list index out of range', '添え字エラー: リストのサイズ以上の添え字の要素にアクセスしようとしました\n');
  output = output.replaceAll(/KeyError: '(.*)'/g, 'キーエラー: キー「$1」は存在しません\n');
  
  // 文法
  output = output.replaceAll('SyntaxError: invalid syntax', '文法エラー: 文法が間違っています\n');
  output = output.replaceAll('SyntaxError: EOL while scanning string literal', '文法エラー: 文字列の終わりのクオーテーションが見つかりません\n');
  
  // 演算
  output = output.replaceAll('ZeroDivisionError: division by zero', 'ゼロ除算エラー: ゼロで割ろうとしました\n');
  
  return output;
}

self.addEventListener('message', (msg) => {
  run(msg.data[0], msg.data[1]);
});
