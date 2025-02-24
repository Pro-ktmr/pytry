import js
import sys
import traceback
from pyodide.console import PyodideConsole


def reformat_exception():
    return "".join(
        traceback.format_exception(
            sys.last_type, sys.last_value, sys.last_traceback)
    )


async def exec_code():
    pyconsole = PyodideConsole(
        filename="<console>", globals={"__code_to_run": __code_to_run}
    )
    pyconsole.stdin_callback = js.stdin_callback
    pyconsole.stdout_callback = js.stdout_callback
    pyconsole.stderr_callback = js.stdout_callback
    await pyconsole.push("exec(__code_to_run, {})")
