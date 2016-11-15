# Copyright (C) 2016  Pierre Marchand <pierremarc07@gmail.com>
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

    # def make_index(self):
    #     doc = DomImpl.createDocument(None, 'section', None)
    #     section = doc.documentElement
    #
    #     index = doc.createElement('page')
    #     template = doc.createAttribute('template')
    #     template.value = 'index'
    #     index.setAttributeNode(template)
    #     title = doc.createElement('title')
    #     content = doc.createElement('content')
    #
    #     title.appendChild(doc.createTextNode('A New Portfolio'))
    #     content.appendChild(doc.createTextNode("""
    #     This is your index page...
    #     """))
    #
    #     index.appendChild(title)
    #     index.appendChild(content)
    #     section.appendChild(index)
    #
    #
    #     assets = ['lodash.js', 'zepto.js', 'velocity.js', 'sectioner.js']
    #     for asset in assets:
    #         a = doc.createElement('asset')
    #         f = doc.createElement('from')
    #         t = doc.createElement('to')
    #         fp = doc.createAttribute('path')
    #         tp = doc.createAttribute('path')
    #         fp.value = 'sectioner/'+asset
    #         tp.value = asset
    #         f.setAttributeNode(fp)
    #         t.setAttributeNode(tp)
    #         a.appendChild(f)
    #         a.appendChild(t)
    #         section.appendChild(a)
    #
    #     index_path = self.home.joinpath('data.xml')
    #     with index_path.open('w') as sink:
    #         sink.write(doc.toprettyxml())
    #
    #     copy_asset('index.html', self.home.joinpath('templates'))

    def install_core (self):
        home = self.home
        images = self.home.joinpath('images')
        styles = self.home.joinpath('styles')
        templates = self.home.joinpath('templates')
        pages = self.home.joinpath('pages')
        js = self.home.joinpath('js')

        images.mkdir()
        styles.mkdir()
        templates.mkdir()
        pages.mkdir()
        js.mkdir()

        copy_asset('data.xml', home)
        copy_asset('example.xml', pages)
        copy_asset('image_0.jpg', images)
        copy_asset('image_1.jpg', images)
        copy_asset('styles.css', styles)

        template_assets = [
            'master.html',
            'media.html',
            'page.html',
            'index.html'
        ]

        js_assets = [
            'lodash.js',
            'sectioner.js',
            'velocity.js',
            'zepto.js'
        ]

        for asset in template_assets:
            copy_asset(asset, templates)

        for asset in js_assets:
            copy_asset(asset, js)


    def build (self):
        self.home.mkdir()
        self.install_core()
        # self.make_index()
