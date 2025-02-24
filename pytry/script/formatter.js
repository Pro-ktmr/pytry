let worker, result = null;

/**
 * フォーマッタの初期化を行う
 */
export function initialize() {
  console.debug("start formatter-worker");
  worker = new Worker('./script/formatter-worker.js');
  console.debug("addEventListener formatter-worker");
  worker.addEventListener('message', workerListenner);
}

/**
 * 引数で与えられたエディタの中身に対してフォーマットを行い更新する
 * @param {any} editor フォーマッタを適用したいエディタ
 */
export async function formatAndUpdateEditor(editor) {
  const formatted = await format(editor.getValue());
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
}

async function format(source) {
  result = null;
  worker.postMessage(source);
  while (result === null) {
    await wait(10);
  }
  return result;
}

const wait = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

function workerListenner(message) {
  switch (message.data.kind) {
    case "result":
      result = message.data.content;
      break;
    case "debug":
      console.debug(message.data.content);
      break;
    default:
      break;
  }
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
