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


def uniq_id (sz):
    u = uuid4()
    return u.hex[:sz]

class Writer:

    def __init__ (self, indir, outdir):
        self.out = Path(outdir)
        self.template = load_template(indir + '/templates', 'master')


    def write (self, fp, data):
        path = self.out.joinpath(fp)
        parent = path.parent

        if parent.exists() == False:
            parent.mkdir(parents=True)

        with path.open('w') as sink:
            sink.write(data)



    def write_page (self, page, index):
        rendered = apply_template(self.template, page)
        name = uniq_id(8)

        if 'slug' in page:
            name = page['slug']

        self.write('{}.html'.format(name), rendered)
