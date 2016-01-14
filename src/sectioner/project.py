
from pkg_resources import resource_string
from pathlib import Path
from click import secho

import xml.dom.minidom as minidom
DomImpl = minidom.getDOMImplementation()

def copy_asset(name, destdir):
    source = resource_string('sectioner', 'data/' + name)
    target_path = destdir.joinpath(name)
    with target_path.open('wb') as sink:
        sink.write(source)
        secho("[copy_asset] {} {}".format(name, target_path), fg="green")

class Project:

    def __init__ (self, name):
        self.home = Path(name)

    def make_index(self):
        doc = DomImpl.createDocument(None, 'section', None)
        section = doc.documentElement

        index = doc.createElement('page')
        template = doc.createAttribute('template')
        template.value = 'index'
        index.setAttributeNode(template)
        title = doc.createElement('title')
        content = doc.createElement('content')

        title.appendChild(doc.createTextNode('A New Portfolio'))
        content.appendChild(doc.createTextNode("""
        This is your index page...
        """))

        index.appendChild(title)
        index.appendChild(content)
        section.appendChild(index)


        assets = ['zepto.js', 'velocity.js', 'sectioner.js']
        for asset in assets:
            a = doc.createElement('asset')
            f = doc.createElement('from')
            t = doc.createElement('to')
            fp = doc.createAttribute('path')
            tp = doc.createAttribute('path')
            fp.value = 'sectioner/'+asset
            tp.value = asset
            f.setAttributeNode(fp)
            t.setAttributeNode(tp)
            a.appendChild(f)
            a.appendChild(t)
            section.appendChild(a)

        index_path = self.home.joinpath('data.xml')
        with index_path.open('w') as sink:
            sink.write(doc.toprettyxml())

        copy_asset('index.html', self.home)

    def install_core (self):
        home = self.home
        media = self.home.joinpath('media')
        sectioner = self.home.joinpath('sectioner')
        media.mkdir()
        sectioner.mkdir()

        assets = [
            'master.html',
            'media.html',
            'page.html',
            'sectioner.js',
            'velocity.js',
            'zepto.js',
        ]

        for asset in assets:
            copy_asset(asset, sectioner)


    def build (self):
        self.home.mkdir()
        self.install_core()
        self.make_index()
