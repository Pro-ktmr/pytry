import py_compile


def compile_code():
    try:
        py_compile.compile("/source.py", doraise=True)
        return ""
    except py_compile.PyCompileError as e:
        return "Traceback (most recent call last):\n" + str(e)
