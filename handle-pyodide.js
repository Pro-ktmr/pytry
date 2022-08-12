let worker, ready;

function initializeWorker() {
  worker = new Worker('worker-pyodide.js');
  disableReady();
  worker.addEventListener('message', workerListenner);
}

window.addEventListener('load', (event) => {
  initializeWorker();
});

function disableReady() {
  ready = false;
  document.getElementById('run-button').innerHTML = '<div class="loader-inner ball-pulse"><div></div><div></div><div></div></div>';
  document.getElementById('run-button').classList.remove('pushable');
}

function enableReady() {
  ready = true;
  document.getElementById('run-button').innerHTML = '実行';
  document.getElementById('run-button').classList.add('pushable');
}

let timer;

async function run() {
  if (ready) {
    outputEditor.setValue('');
    outputEditor.revealLine(0);
    editor.markers = [];
    monaco.editor.setModelMarkers(editor.getModel(), 'message', editor.markers);

    const formatted = await formatSource(editor.getValue());
    if (formatted != editor.getValue()) {
      editor.pushUndoStop();
      editor.executeEdits('formatter', [{
        range: {
          startLineNumber: 1,
          endLineNumber: 1000000000,
          startColumn: 1,
          endColumn: 1000000000,
        },
        text: formatted,
      }]);
    }

    disableReady();
    timer = setTimeout(cancelRunning, 10000);
    worker.postMessage([editor.getValue(), inputEditor.getValue().replaceAll('\r', '')]);
  }
}

function workerListenner(msg) {
  const kind = msg.data['kind'];

  if (kind == 'ready') {
    if (timer) clearTimeout(timer);
    enableReady();
    return;
  }

  if (kind == 'done') {
    if (timer) clearTimeout(timer);
    enableReady();
    return;
  }

  if (kind == 'internal_error') {
    const error = msg.data['content'];
    outputEditor.setValue(outputEditor.getValue() + error);
    if (timer) clearTimeout(timer);
    enableReady();
    return;
  }

  if (kind == 'stdout') {
    const output = msg.data['content'];
    outputEditor.setValue(outputEditor.getValue() + output);
  }

  if (kind == 'error') {
    const error = msg.data['content'];
    outputEditor.setValue(outputEditor.getValue() + formatErrorMessage(error));

    let err = [...formatErrorMessage(error).matchAll(/プログラムの (\d*) 行目/g)];
    if (err != null && err.length != 0) {
      let l = Number(err[err.length - 1][1]);
      editor.markers = [{
        startLineNumber: l,
        startColumn: 1,
        endLineNumber: l,
        endColumn: 1000,
        message: formatErrorMessage(error),
        severity: monaco.MarkerSeverity.Error,
      }];
      monaco.editor.setModelMarkers(editor.getModel(), 'message', editor.markers);
    }

    sendSubmission(editor.getValue(), inputEditor.getValue(), outputEditor.getValue(), formatErrorMessage(error));
  }
}

function cancelRunning() {
  outputEditor.setValue('実行から 10 秒が経過したため処理を打ち切りました\n次に実行できるようになるまで数秒かかります');
  outputEditor.setValue(outputEditor.getValue() + '実行から 10 秒が経過したため処理を打ち切りました\n次に実行できるようになるまで数秒かかります\n');
  sendSubmission(editor.getValue(), inputEditor.getValue(), outputEditor.getValue(), '');
  worker.terminate();
  initializeWorker();
}

/* Error handler */

function formatErrorMessage(original) {
  if (original == '') return '';

  let formatted = original;

  // 基本
  formatted = formatted.replaceAll('Traceback (most recent call last):', 'エラー発生:');
  formatted = formatted.replaceAll(/(.*)File "Main.py", line (\d*)(.*)/g, '$1プログラムの $2 行目');

  // インデント
  formatted = formatted.replaceAll('IndentationError: expected an indented block', 'インデントエラー: インデントを忘れています');
  formatted = formatted.replaceAll('IndentationError: unexpected indent', 'インデントエラー: インデントがおかしな位置にあります');
  formatted = formatted.replaceAll('IndentationError: unindent does not match any outer indentation level', 'インデントエラー: インデントが揃っていません');
  formatted = formatted.replaceAll('SyntaxError: invalid non-printable character U+3000', '文法エラー: 全角スペースが紛れ込んでいます (半角スペース 2 個に直しましょう)');

  // 入出力
  formatted = formatted.replaceAll(/ValueError: invalid literal for int\(\) with base 10: '(.*)'/g, '値エラー: 「$1」を整数に変換できません (入力の受け取り方や入力欄が正しくないことがあります)');
  formatted = formatted.replaceAll(/ValueError: not enough values to unpack \(expected (.*), got (.*)\)/g, '値エラー: $2 個しかないデータを $1 個に分けようとしました (入力の受け取り方や入力欄が正しくないことがあります)');
  formatted = formatted.replaceAll(/ValueError: too many values to unpack \(expected (.*)\)/g, '値エラー: $1 個より多いデータを $1 個に分けようとしました (入力の受け取り方や入力欄が正しくないことがあります)');
  formatted = formatted.replaceAll('EOFError: EOF when reading a line', 'ファイル末尾エラー: ファイルの末尾に到達しました (入力の受け取り方や入力欄が正しくないことがあります)');

  // 存在しない
  formatted = formatted.replaceAll(/NameError: name '(.*)' is not defined/g, '名前エラー: 「$1」が見つかりません');
  formatted = formatted.replaceAll('IndexError: string index out of range', '添え字エラー: 文字列の長さ以上の添え字の文字にアクセスしようとしました');
  formatted = formatted.replaceAll('IndexError: list index out of range', '添え字エラー: リストのサイズ以上の添え字の要素にアクセスしようとしました');
  formatted = formatted.replaceAll(/KeyError: '(.*)'/g, 'キーエラー: キー「$1」は存在しません');
  formatted = formatted.replaceAll(/AttributeError: '(.*)' object has no attribute '(.*)'/g, '属性エラー: 「$1」のオブジェクトに「$2」という属性は存在しません');

  // 文法
  formatted = formatted.replaceAll('SyntaxError: invalid syntax', '文法エラー: 文法が間違っています');
  formatted = formatted.replaceAll('SyntaxError: cannot assign to operator', '文法エラー: 代入時の左辺に演算子は使えません');
  formatted = formatted.replaceAll('SyntaxError: EOL while scanning string literal', '文法エラー: 文字列の終わりのクオーテーションが見つかりません');
  formatted = formatted.replaceAll(/SyntaxError: invalid character '(.*)' \((.*)\)/g, '文法エラー: 「$1」という文字は使えません (誤って全角文字を使っていることがあります)');
  formatted = formatted.replaceAll('SyntaxError: unexpected EOF while parsing', '文法エラー: 括弧などを閉じないまま行が終わってしまいました');

  // 演算
  formatted = formatted.replaceAll('ZeroDivisionError: division by zero', 'ゼロ除算エラー: ゼロで割ろうとしました');
  formatted = formatted.replaceAll(/TypeError: unsupported operand type\(s\) for (.*): '(.*)' and '(.*)'/g, '型エラー: 「$2」と「$3」の間で「$1」の計算はできません');
  formatted = formatted.replaceAll(/TypeError: '(.*)' not supported between instances of '(.*)' and '(.*)'/g, '型エラー: 「$2」と「$3」の間で「$1」の計算はできません');

  // 関数
  formatted = formatted.replaceAll(/TypeError: '(.*)' object is not callable/g, '型エラー: 「$1」のオブジェクトは関数ではないので ( ) を付けても呼び出せません');
  formatted = formatted.replaceAll(/TypeError: (.*) must have at least two arguments./g, '型エラー: $1 には少なくとも 2 つの引数が必要です');
  formatted = formatted.replaceAll(/TypeError: (.*) argument must be a string, a bytes-like object or a number, not '(.*)'/g, '型エラー: $1 の引数が「$2」であってはいけません');
  formatted = formatted.replaceAll(/TypeError: '(.*)' is an invalid keyword argument for (.*)/g, '型エラー: $2 に「$1」という引数はありません');

  // 単語
  formatted = formatted.replaceAll('NoneType', '値ではないもの');
  formatted = formatted.replaceAll('builtin_function_or_method', '組み込み関数');

  // その他
  formatted = formatted.replaceAll(/ModuleNotFoundError: No module named '(.*)'/g, 'モジュールエラー: 「$1」というモジュールが見つかりません (micropip でインストールできるかもしれません)');

  return `\n${formatted}${searchWarnings()}\n=== エラー原文 ===\n${original}==================`;
}

function searchWarnings() {
  let res = '';
  const lines = editor.getValue().split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // コロン忘れ
    if (line.match(/^\s*if\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「if 条件式:」の末尾のコロンを忘れていませんか？\n`;
    }
    if (line.match(/^\s*elif\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「elif 条件式:」の末尾のコロンを忘れていませんか？\n`;
    }
    if (line.match(/^\s*elif\s*:/g) !== null) {
      res += `${i + 1} 行目は「elif 条件式:」か「else:」のいずれかではありませんか？\n`;
    }
    if (line.match(/^\s*else\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「else:」の末尾のコロンを忘れていませんか？\n`;
    }
    if (line.match(/^\s*for\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「for 変数名 in range(繰り返し回数):」の末尾のコロンを忘れていませんか？\n`;
    }
    if (line.match(/^\s*while\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「while 条件式:」の末尾のコロンを忘れていませんか？\n`;
    }

    // 比較演算子
    if (line.match(/=>/g) !== null) {
      res += `${i + 1} 行目の => は >= ではありませんか？\n`;
    }
    if (line.match(/=</g) !== null) {
      res += `${i + 1} 行目の =< は <= ではありませんか？\n`;
    }
    if (line.match(/=!/g) !== null) {
      res += `${i + 1} 行目の =! は != ではありませんか？\n`;
    }
    if (line.match(/(if|while)[^=]*=[^=]/g) !== null && line.match(/>=|<=|!=|=>|=<|=!/g) == null) {
      res += `${i + 1} 行目の = は == ではありませんか？\n`;
    }
  }
  if (res == '') return '';
  return `\n提案：\n${res}(提案は間違っていることもあります)\n`;
}

/* Formatter */

async function loadFormatter() {
  const pyodide = await loadPyodide({
    indexURL: location.href + '/pyodide',
  });
  await pyodide.loadPackage('micropip');
  await pyodide.runPythonAsync(`
import micropip
await micropip.install('black')
import black
def __format(code):
    try:
        return black.format_str(code, mode=black.FileMode())
    except black.parsing.InvalidInput:
        return code`);
  self.postMessage('ready');
  return pyodide;
}
const foratterReadyPromise = loadFormatter();

async function formatSource(source) {
  if (!document.getElementById('toggle_auto_format').checked) {
    return source;
  }
  const pyodide = await foratterReadyPromise;
  pyodide.globals.set('__code_to_format', source);
  const formatted = pyodide.runPython('__format(__code_to_format)');
  return formatted;
}

class PyTryOnTypeFormattingEditProvider {
  constructor() {
    this.autoFormatTriggerCharacters = ['\n'];
  }

  async provideOnTypeFormattingEdits(model, position, ch, options, token) {
    const source = model.getValue();

    let begin = '';
    if (source.substr(0, 2) == '\n\n') begin = '\n\n';
    else if (source.substr(0, 1) == '\n') begin = '\n';
    let end = '';
    if (source.substr(source.length - 2, 2) == '\n\n') end = '\n';

    let formatted = await formatSource(source);
    if (formatted != source) {
      formatted = begin + formatted + end;
    }

    return [{
      range: {
        startLineNumber: 1,
        endLineNumber: 1000000000,
        startColumn: 1,
        endColumn: 1000000000,
      },
      text: formatted,
    }];
  }
}

/* Send */

function sendSubmission(source, input, output, error) {
  const param = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      time: getTime(),
      source: JSON.stringify(source.substr(0, 5000)),
      input: JSON.stringify(input.substr(0, 5000)),
      output: JSON.stringify(output.substr(0, 5000)),
      error: JSON.stringify(error.substr(0, 5000)),
    }),
    credentials: 'include',
  };
  fetch('https://ktmr.vsw.jp/pytry/run.php', param)
    .then(response => response.json())
    .then(json => {
      if (!json.status) {
        console.log(`${json.result}`);
      }
    })
    .catch(error => {
      console.log(`${error}`);
    });
}

function getTime() {
  var date = new Date();
  var y = date.getFullYear();
  var mo = ('00' + (date.getMonth() + 1)).slice(-2);
  var d = ('00' + date.getDate()).slice(-2);
  var h = ('00' + date.getHours()).slice(-2);
  var mi = ('00' + date.getMinutes()).slice(-2);
  var s = ('00' + date.getSeconds()).slice(-2);
  var ms = ('000' + date.getMilliseconds()).slice(-3);
  return y + '-' + mo + '-' + d + '_' + h + '-' + mi + '-' + s + '-' + ms;
}
