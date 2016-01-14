from pathlib import Path
import xml.dom.minidom as minidom
import click
import json
from slugify import slugify
from .template import (load_template, apply_template)

def serialize (data, key):
    out = []
    for page in data:
        out.append(page[key])
    return json.dumps(out)

class Writer:

    def __init__ (self, indir, outdir):
        self.out = Path(outdir)
        self.template = load_template(indir + '/sectioner', 'master')


    def write (self, fp, data):
        path = self.out.joinpath(fp)
        parent = path.parent

        if parent.exists() == False:
            parent.mkdir(parents=True)

        with path.open('w') as sink:
            sink.write(data)



    def write_page (self, index, data):
        page = data[index]

        tdata = dict(
            collection=serialize(data, 'html'),
            index=index,
            page=page['html']
        )

        rendered = apply_template(self.template, tdata)
        name = 'page_{}'.format(index)
        if 'title' in page['data']:
            name = slugify(page['data']['title'])
        if 0 == index:
            name = 'index'

        self.write('{}.html'.format(name), rendered)
