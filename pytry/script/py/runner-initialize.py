def reformat_exception():
    import sys
    import traceback


    return "".join(
        traceback.format_exception(
            sys.last_type, sys.last_value, sys.last_traceback)
    )


async def exec_code():
    import js
    import matplotlib.pyplot as plt

    from pyodide.console import PyodideConsole


    plt.clf()
    pyconsole = PyodideConsole(
        filename="<console>", globals={"__code_to_run": __code_to_run}
    )
    pyconsole.stdin_callback = js.stdin_callback
    pyconsole.stdout_callback = js.stdout_callback
    pyconsole.stderr_callback = js.stdout_callback
    await pyconsole.push("exec(__code_to_run, {})")


def show_image_pytry(*args, **kwargs):
    import base64
    import io
    import js
    import matplotlib.pyplot as plt


    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    image_str = "data:image/png;base64," + base64.b64encode(buf.read()).decode("utf-8")
    js.image_callback(image_str)



def replace_show():
    import matplotlib.pyplot as plt_pytry


    plt_pytry.show = show_image_pytry

replace_show()
