import micropip


async def install_black():
    await micropip.install("black == 22.12.0")


def format_code():
    try:
        return black.format_str(__code_to_format, mode=black.FileMode())
    except black.parsing.InvalidInput:
        return __code_to_format
