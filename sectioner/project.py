# Copyright (C) 2016  Pierre Marchand <pierremarc@oep-h.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


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
