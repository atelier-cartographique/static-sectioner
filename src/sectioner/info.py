

from pathlib import Path
import xml.dom.minidom as minidom
import click

from template import (load_template, apply_template)


def get_content (node):
    out = []
    for n in node.childNodes:
        out.append(n.toxml())
    return '\n'.join(out)

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
                key = child.tagName
                val = get_content(child)
                media_data[key] = val
        data[name] = media_data

    return data

class Builder:

    def __init__ (self, indir, outdir, asset_compiler):
        self.home = Path(indir)
        self.out = Path(outdir)
        self.sectioner = self.home.joinpath('sectioner')
        self.compiler = asset_compiler

        self.page_template = load_template(self.sectioner.as_posix(), 'page')
        self.media_template = load_template(self.sectioner.as_posix(), 'media')

    def build_media (self, mediadir):
        template = self.media_template
        media_path = self.home.joinpath(mediadir).absolute()
        meta_path = media_path.joinpath('meta.xml')
        meta = get_media_meta(meta_path)
        output = []
        for media in media_path.iterdir():
            if media.is_file():
                name = media.name
                print("build_media {}".format(media))
                data = dict(source = 'images/' + name)
                if name in meta:
                    data.update(meta[name])
                output.append(apply_template(template, data))
                self.compiler.add(media.as_posix(), 'images/' + name)

        return '\n'.join(output)

    def parse_asset (self, asset):
        data = dict()

        for child in asset.childNodes:
            if child.ELEMENT_NODE == child.nodeType:
                key = child.tagName
                path_attr = child.attributes.getNamedItem('path')
                data[key] = path_attr.value

        proc_attr = asset.attributes.getNamedItem('processor')
        if proc_attr:
            data['processor'] = proc_attr.value
        else:
            data['processor'] = None

        if 'to' not in data:
            data['to'] = data['from']

        self.compiler.add(data['from'], data['to'], data['processor'])


    def parse_page (self, page):
        data = dict()
        page_template = self.page_template

        for child in page.childNodes:
            if child.ELEMENT_NODE == child.nodeType:
                key = child.tagName
                val = get_content(child)
                data[key] = val

        attr_keys = page.attributes.keys()

        if 'media' in attr_keys:
            mediadir = page.attributes['media'].value
            data['media'] = data['media'] = self.build_media(mediadir)

        if 'template' in attr_keys:
            template_name = page.attributes['template'].value
            page_template = load_template(self.home.as_posix(), template_name)

        rendered = apply_template(page_template, data)
        return dict(data=data, html=rendered)

    def build (self):
        data = []
        datapath = self.home.joinpath('data.xml')
        dom = minidom.parse(datapath.absolute().as_posix())
        for page in dom.getElementsByTagName('page'):
            data.append(self.parse_page(page))

        for asset in dom.getElementsByTagName('asset'):
            self.parse_asset(asset)

        return data
