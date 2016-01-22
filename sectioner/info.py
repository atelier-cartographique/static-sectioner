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



from pathlib import Path
from tempfile import TemporaryFile
import xml.dom.minidom as minidom
import json
import click
from slugify import slugify
from PIL import Image
Image.init() # we need this for is_image

from .template import (load_template, apply_template)
from .image import WebImage


def get_content (node):
    out = []
    for n in node.childNodes:
        out.append(n.toxml())
    return '\n'.join(out)

def get_text (node):
    rc = []
    for n in node.childNodes:
        if n.nodeType == n.TEXT_NODE:
            rc.append(n.data)
    return ''.join(rc)

def get_media_meta (path):
    data = dict()
    if not path.exists():
        return data
    dom = minidom.parse(path.as_posix())
    medias = dom.getElementsByTagName('media')

    for media in medias:
        name_attr = media.attributes.getNamedItem("name")
        if not name_attr:
            continue
        name = name_attr.value
        media_data = dict()
        for child in media.childNodes:
            if child.ELEMENT_NODE == child.nodeType:
                key = 'media.' + child.tagName
                val = get_content(child)
                media_data[key] = val
        data[name] = media_data

    return data

def is_image (path):
    if path.is_file():
        ext = path.suffix
        if ext in Image.EXTENSION:
            mime_id = Image.EXTENSION[ext]
            if mime_id in Image.MIME:
                return True
    return False



class Builder:

    def __init__ (self, indir, outdir, asset_compiler):
        self.home = Path(indir)
        self.out = Path(outdir)
        self.sectioner = self.home.joinpath('sectioner')
        self.compiler = asset_compiler

        self.page_template = load_template(self.sectioner.as_posix(), 'page')
        self.media_template = load_template(self.sectioner.as_posix(), 'media')

    def build_media (self, mediadir):
        # return dict()
        template = self.media_template
        media_path = self.home.joinpath(mediadir).absolute()
        meta_path = media_path.joinpath('meta.xml')
        meta = get_media_meta(meta_path)
        root = 'images'
        items = []
        for media in media_path.iterdir():
            if is_image(media):
                name = media.name
                print("build_media {}".format(media))
                wi = WebImage(media, 'images', self.compiler)
                data = dict()
                if name in meta:
                    data.update(meta[name])
                html = apply_template(template, data)
                items.append(dict(html=html, sizes=wi.get_data()))

        return dict(root=root, items=items)

    def parse_asset (self, asset):
        data = dict()

        for child in asset.childNodes:
            if child.ELEMENT_NODE == child.nodeType:
                key = child.tagName
                path_attr = child.attributes.getNamedItem('path')
                data[key] = path_attr.value


        if 'to' not in data:
            data['to'] = data['from']

        self.compiler.add(data['from'], data['to'])


    def parse_page (self, page):
        data = dict()
        page_template = self.page_template

        for child in page.childNodes:
            if child.ELEMENT_NODE == child.nodeType:
                key = 'page.' + child.tagName
                val = get_content(child)
                if 'title' == child.tagName:
                    data['slug'] =  slugify(get_text(child))
                data[key] = val

        attr_keys = page.attributes.keys()


        if 'template' in attr_keys:
            template_name = page.attributes['template'].value
            page_template = load_template(self.home.as_posix(), template_name)

        data['page.html'] = apply_template(page_template, data)

        if 'media' in attr_keys:
            mediadir = page.attributes['media'].value
            data['media'] = self.build_media(mediadir)

        return data

    def build (self):
        data = []
        datapath = self.home.joinpath('data.xml')
        dom = minidom.parse(datapath.absolute().as_posix())
        index = 0
        for page in dom.getElementsByTagName('page'):
            page_data = self.parse_page(page)
            page_data['page.index'] = index
            data.append(page_data)
            index += 1

        data_loader = """
(function initData(w){{
w.Sectioner = new Object();
w.Sectioner.pages = {};
Object.freeze(w.Sectioner.pages);
}})(window);
        """.format(json.dumps(data, indent=2)).encode('UTF-8')

        data_js = TemporaryFile()
        data_js.write(data_loader)
        self.compiler.add_file(data_js, 'data.js')

        for asset in dom.getElementsByTagName('asset'):
            self.parse_asset(asset)

        return data
