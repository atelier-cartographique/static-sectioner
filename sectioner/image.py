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
from hashlib import md5
from pathlib import Path
from PIL import Image

SIZES = (
    2000,
    1800,
    1600,
    1400,
    1200,
    1000,
    800,
    600,
    400
    )

def uniq_id (data):
    hex = md5(data).hexdigest()
    return hex

def get_size (w, h, target):
    if w > h:
        r = target / w
    else:
        r = target / h
    tw = w * r
    th = h * r
    return (tw, th)


class WebImage:

    def __init__ (self, path, out_dirname, compiler):
        self.path = path
        self.out_dirname = out_dirname
        self.compiler = compiler

    def get_extension (self):
        return self.format.lower()

    def get_target_path (self, basename, sz = None):
        ext = self.get_extension()
        if sz:
            return '{}/{}_{}.{}'.format(self.out_dirname, basename, sz, ext)
        return '{}/{}.{}'.format(self.out_dirname, basename, ext)

    def build_data (self, im, basename):
        data = []
        data.append([im.width, im.height, self.get_target_path(basename)])
        for sz in SIZES:
            target_size = get_size(im.width, im.height, sz)
            target = self.get_target_path(basename, sz)
            data.append([target_size[0], target_size[1], target])

        return data

    def build_images (self, im, basename):
        comp = self.compiler
        target = self.get_target_path(basename)
        orig = TemporaryFile()
        if im.mode == "CMYK":
            im = im.convert("RGB")
        im.save(orig, self.format, optimize=True)
        comp.add_file(orig, target)
        for sz in SIZES:
            t = im.copy()
            t.thumbnail((sz,sz), Image.BICUBIC)
            f = TemporaryFile()
            t.save(f, self.format, optimize=True)
            target = self.get_target_path(basename, sz)
            comp.add_file(f, target)


    def get_data (self):
        with Image.open(self.path.as_posix()) as im:
            self.format = im.format
            uid = uniq_id(im.tobytes())
            target_path = Path(self.get_target_path(uid))
            exists = self.compiler.target_exists(target_path)
            print('target {} {}'.format(target_path.as_posix(), exists))
            if False == exists:
                self.build_images(im, uid)

            return self.build_data(im, uid)
