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
import xml.dom.minidom as minidom
from uuid import uuid4
import click
from .template import (load_template, apply_template)


def uniq_id(sz):
    u = uuid4()
    return u.hex[:sz]


def get_master_template(home):
    template_dir = home.joinpath('templates')
    template_name = 'master'
    datapath = home.joinpath('data.xml')
    dom = minidom.parse(datapath.absolute().as_posix())
    section = dom.firstChild
    template_root_attr = section.attributes.getNamedItem('templates-dir')
    if template_root_attr:
        tr = template_root_attr.value
        template_dir = home.joinpath(tr)
    template_master_attr = section.attributes.getNamedItem('template-master')
    if template_master_attr:
        template_name = template_master_attr.value

    return load_template(template_dir.as_posix(), template_name)


class Writer:

    def __init__(self, indir, outdir):
        self.out = Path(outdir)
        self.template = get_master_template(Path(indir))

    def write(self, fp, data):
        path = self.out.joinpath(fp)
        parent = path.parent

        if parent.exists() == False:
            parent.mkdir(parents=True)

        with path.open('w') as sink:
            sink.write(data)

    def write_page(self, page, index):
        rendered = apply_template(self.template, page)
        name = uniq_id(8)

        if 'slug' in page:
            name = page['slug']

        self.write('{}.html'.format(name), rendered)
