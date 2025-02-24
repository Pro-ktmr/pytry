import * as editor from './editor.js';
import * as logger from './logger.js';

let timer = null, previousHints = new Set([]);

/**
 * ヒント発見器の初期化を行う
 */
export function initialize() {
  editor.sourceChangeListenner.push(onDidChangeContent);
  timer = setTimeout(timerHandler, 3200);
}

function onDidChangeContent() {
  editor.clearSourceEditorMarker('Info');

  if (timer) clearTimeout(timer);
  timer = setTimeout(timerHandler, 150);
}

function timerHandler() {
  findHints();
  timer = setTimeout(timerHandler, 150);
}

/**
 * ソースに含まれるよくある誤りを発見して改善の提案を行う
 */
export function findHints() {
  const lines = editor.sourceEditor.getValue().split('\n');
  const hints = new Set([]);
  for (let i = 0; i < lines.length; i++) {
    if (i + 1 == logger.getCurrentLineNumber()) continue;

    const line = lines[i].replace(/#.*/i, '').trimEnd();
    let hint = '';

    const addHint = (h) => {
      hint += h + '\n';
      if (!previousHints.has(hint)) {
        logger.log('hint_found', {
          line_number: i + 1,
          three_lines: logger.getThreeLines(i + 1),
          hint: h,
        });
      }
      hints.add(hint);
    };

    // if, for, while 関連
    if (line.match(/^\s*if\s[^:]*$/g) !== null) {
      //addHint('「if 条件式:」の末尾のコロンを忘れていませんか？');
    }
    if (line.match(/^\s*elif\s[^:]*$/g) !== null) {
      //addHint('「elif 条件式:」の末尾のコロンを忘れていませんか？');
    }
    if (line.match(/^\s*elif\s*:/g) !== null) {
      addHint('「elif 条件式:」か「else:」のいずれかではありませんか？');
    }
    if (line.match(/^\s*else\s[^:]*$/g) !== null) {
      //addHint('「else:」の末尾のコロンを忘れていませんか？');
    }
    if (line.match(/^\s*else\s[^:]+:$/g) !== null) {
      addHint('「elif 条件式:」ではありませんか？');
    }
    if (line.match(/^\s*for\s[^:]*$/g) !== null) {
      //addHint('「for 変数名 in 繰り返す内容:」の末尾のコロンを忘れていませんか？');
    }
    if (line.match(/^\s*while\s[^:]*$/g) !== null) {
      //addHint('「while 条件式:」の末尾のコロンを忘れていませんか？');
    }
    if (line.match(/^\s*if\s.*?:.+/g) !== null) {
      addHint('「if 条件式:」の末尾のコロンの後に何か書かれています．');
    }
    if (line.match(/^\s*elif\s.*?:.+/g) !== null) {
      addHint('「elif 条件式:」の末尾のコロンの後に何か書かれています．');
    }
    if (line.match(/^\s*while\s.*?:.+/g) !== null) {
      addHint('「while 条件式:」の末尾のコロンの後に何か書かれています．');
    }
    if (line.match(/^\s*for.*in\s*len\(.*\)\s*:\s*/g) !== null) {
      addHint('len( ) は range(len( )) と囲んだ方が良いのではありませんか？');
    }

    // 比較演算子
    if (line.match(/=>/g) !== null) {
      addHint('=> は >= ではありませんか？');
    }
    if (line.match(/=</g) !== null) {
      addHint('=< は <= ではありませんか？');
    }
    if (line.match(/=!/g) !== null) {
      addHint('=! は != ではありませんか？');
    }
    if (line.match(/!==/g) !== null) {
      addHint('!== は != ではありませんか？');
    }
    if (line.match(/>==/g) !== null) {
      addHint('>== は >= ではありませんか？');
    }
    if (line.match(/<==/g) !== null) {
      addHint('<== は <= ではありませんか？');
    }
    if (line.match(/<>/g) !== null) {
      addHint('<> は != ではありませんか？');
    }
    if (line.match(/> =/g) !== null) {
      addHint('> = は >= ではありませんか？ (間の空白をなくす)');
    }
    if (line.match(/< =/g) !== null) {
      addHint('< = は <= ではありませんか？ (間の空白をなくす)');
    }
    if (line.match(/= =/g) !== null) {
      addHint('= = は == ではありませんか？ (間の空白をなくす)');
    }
    if (line.match(/! =/g) !== null) {
      addHint('! = は != ではありませんか？ (間の空白をなくす)');
    }
    if (line.match(/(if|while)[^=]*=[^=]/g) !== null && line.match(/>\s*=|<\s*=|!\s*=|=\s*>|=\s*<|=\s*!/g) == null) {
      addHint('= は == ではありませんか？');
    }

    // その他
    if (line.match(/input\([^\)]+\)/g) !== null) {
      addHint('PyTry では input() の括弧内に何か記述するのは非推奨です．');
    }
    if (line.match(/^\s*print\s*=/g) !== null) {
      addHint('イコールではなく括弧の print() ではありませんか？');
    }
    if (line.match(/\w\[[^\[\]]{0,3}\,[^\[\]]{0,3}\]/g) !== null) {
      addHint('[ ] の間のコンマ , はスライスのコロン : ではありませんか？');
    }

    if (hint != '') {
      editor.addSourceEditorMarker(i + 1, `${hint}(この提案は間違っていることもあります)`, 'Info');
    }
  }
  previousHints = hints;
}
