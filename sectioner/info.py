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


from pathlib import Path
from tempfile import TemporaryFile
import xml.dom.minidom as minidom
import json
import click
from slugify import slugify


from .template import (load_template, apply_template)
from .image import (WebImage, ImageError)

import logging
logger = logging.getLogger('Sectioner')


def get_content(node):
    out = []
    for n in node.childNodes:
        out.append(n.toxml())
    return '\n'.join(out)


def get_text(node):
    rc = []
    for n in node.childNodes:
        if n.nodeType == n.TEXT_NODE:
            rc.append(n.data)
    return ''.join(rc)


def get_media_meta(gallery):
    data = dict()
    names = []
    medias = gallery.getElementsByTagName('media')

    for media in medias:
        name_attr = media.attributes.getNamedItem("name")
        if not name_attr:
            continue
        name = name_attr.value
        names.append(name)
        media_data = dict()
        for child in media.childNodes:
            if child.ELEMENT_NODE == child.nodeType:
                key = 'media.' + child.tagName
                val = get_content(child)
                media_data[key] = val
        data[name] = media_data

    return (names, data)


def load_href(path, tag_name=None):
    if (path.exists()):
        try:
            dom = minidom.parse(path.absolute().as_posix())
        except Exception as ex:
            raise Exception('minidom failed to parse "{}" because of\n\t {}'.format(
                path.absolute().as_posix(), ex))
        element = dom.documentElement
        if tag_name and (element.tagName != tag_name):
            raise Exception('Wrong Tag Name In {}, expected {}, got {}'.format(
                path.absolute().as_posix(),
                tag_name,
                element.tagName
            ))
        return element
    raise Exception('File Not Found {}'.format(path.absolute().as_posix()))


class Builder:

    def __init__(self, indir, outdir, asset_compiler,  with_media=True):
        self.home = Path(indir)
        self.out = Path(outdir)
        self.with_media = with_media
        self.compiler = asset_compiler

    def build_media(self, gallery):
        attr_keys = gallery.attributes.keys()
        mediadir = Path(self.home)
        if 'root' in attr_keys:
            mediadir = mediadir.joinpath(gallery.attributes['root'].value)
        template = self.media_template
        media_path = mediadir.absolute()
        names, meta = get_media_meta(gallery)
        root = 'images'
        items = []
        for name in names:
            media = media_path.joinpath(name)
            data = dict()
            if name in meta:
                data.update(meta[name])
                html = apply_template(template, data)

            if self.with_media:
                try:
                    logger.debug("build_media {}".format(media))
                    wi = WebImage(media, 'images', self.compiler)
                    items.append(dict(html=html, sizes=wi.get_data()))
                except Exception as ex:
                    click.secho(
                        "Failed on Image: {}".format(ex), err=True, fg='red')
            else:
                logger.debug('skipping image {}'.format(media))
                items.append(
                    dict(html=html, sizes=[[1000, 1000, 'XXXXXXXXX']]))

        return dict(root=root, items=items)

    def parse_asset(self, asset):
        data = dict()

        for child in asset.childNodes:
            if child.ELEMENT_NODE == child.nodeType:
                key = child.tagName
                path_attr = child.attributes.getNamedItem('path')
                data[key] = path_attr.value

        if 'to' not in data:
            data['to'] = data['from']

        self.compiler.add(data['from'], data['to'])

    def parse_page(self, page):
        data = dict()
        page_template = self.page_template
        attr_keys = page.attributes.keys()

        if 'href' in attr_keys:
            page_href = self.home.joinpath(page.attributes['href'].value)
            page = load_href(page_href, 'page')
            attr_keys = page.attributes.keys()

        for child in page.childNodes:
            if child.ELEMENT_NODE == child.nodeType:
                if 'gallery' == child.tagName:
                    data['media'] = self.build_media(child)
                else:
                    key = 'page.' + child.tagName
                    val = get_content(child)
                    if 'title' == child.tagName:
                        data['slug'] = slugify(get_text(child))
                    data[key] = val

        if 'template' in attr_keys:
            template_name = page.attributes['template'].value
            page_template = load_template(
                self.template_dir.as_posix(), template_name)

        data['page.html'] = apply_template(page_template, data)

        # if 'media' in attr_keys:
        #     mediadir = page.attributes['media'].value
        #     data['media'] = self.build_media(mediadir)

        if 'slug' in attr_keys:
            logger.debug(
                'slug {} {}'.format(data['slug'], page.attributes['slug'].value))
            data['slug'] = page.attributes['slug'].value

        return data

    def set_templates(self, section):
        self.template_dir = self.home.joinpath('templates')
        template_root_attr = section.attributes.getNamedItem('templates-dir')
        if template_root_attr:
            tr = template_root_attr.value
            self.template_dir = self.home.joinpath(tr)

        self.page_template = load_template(
            self.template_dir.as_posix(), 'page')
        self.media_template = load_template(
            self.template_dir.as_posix(), 'media')

    def build(self):
        data = []
        datapath = self.home.joinpath('data.xml')
        dom = minidom.parse(datapath.absolute().as_posix())
        self.set_templates(dom.firstChild)
        index = 0

        for page in dom.getElementsByTagName('page'):
            try:
                page_data = self.parse_page(page)
                page_data['page.index'] = index
                data.append(page_data)
                index += 1
            except Exception as ex:
                click.secho(
                    'Failed on Page: {}'.format(ex), err=True, fg='red')

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
