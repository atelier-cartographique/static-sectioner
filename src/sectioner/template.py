
from pathlib import Path
from string import Template
from click import secho


def load_template (dirpath, name):
    home = Path(dirpath)
    template_path = home.joinpath(name + '.html')
    with template_path.open() as template_file:
        template = Template(template_file.read())

    return template


def apply_template (template, data):
    data_local = dict(data)
    while True:
        try:
            return template.substitute(data_local)
        except KeyError as k:
            secho("[template] missing key {}".format(k), fg="red")
            data_local[k.args[0]] = ""
            print()
