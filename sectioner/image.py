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



from tempfile import TemporaryFile
from uuid import uuid4
from PIL import Image

SIZES = (
    2000,
    # 1800,
    1600,
    # 1400,
    1200,
    # 1000,
    800,
    # 600,
    400
    )

def uniq_id (ext=None):
    u = uuid4()
    if ext:
        return '{}.{}'.format(u.hex, ext)
    return u.hex

class WebImage:

    def __init__ (self, path, out_dirname, compiler):
        self.path = path
        self.out_dirname = out_dirname
        self.compiler = compiler

    def get_data (self):
        ppath = self.path.as_posix()
        comp = self.compiler
        data = []
        with Image.open(ppath) as im:
            orig = TemporaryFile()
            im.save(orig, 'PNG', optimize=True)
            target = '{}/{}'.format(self.out_dirname, uniq_id('png'))
            data.append([im.width, im.height, target])
            comp.add_file(orig, target)
            for sz in SIZES:
                t = im.copy()
                t.thumbnail((sz,sz), Image.BICUBIC)
                f = TemporaryFile()
                t.save(f, 'PNG', optimize=True)
                target = '{}/{}'.format(self.out_dirname, uniq_id('png'))
                data.append([t.width, t.height, target])
                comp.add_file(f, target)


        return data
