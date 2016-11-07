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



import os
from stat import *
from tempfile import TemporaryFile
from hashlib import md5
from pathlib import Path
from PIL import Image
import json

import logging
logger = logging.getLogger('Sectioner')

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

class NoCache(Exception):
    pass

class WebImage:

    def __init__ (self, path, out_dirname, compiler, cache_dir):
        self.path = path
        self.out_dirname = out_dirname
        self.compiler = compiler
        self.cache_dir = cache_dir
        stat_info = os.stat(path.as_posix())
        self.basename = uniq_id('{}.{}'.format(stat_info[ST_MTIME], stat_info[ST_SIZE]).encode('utf8'))


    def get_extension (self):
        return self.path.suffix


    def get_target_path (self, sz=None, ext=None):
        if not ext:
            ext = self.get_extension()
        if sz:
            return '{}/{}_{}{}'.format(self.out_dirname, self.basename, sz, ext)
        return '{}/{}{}'.format(self.out_dirname, self.basename, ext)


    def build_data (self, im):
        data = []
        data.append([im.width, im.height, self.get_target_path()])
        for sz in SIZES:
            target_size = get_size(im.width, im.height, sz)
            target = self.get_target_path(sz=sz)
            data.append([target_size[0], target_size[1], target])
        return data


    def build_images (self, im):
        comp = self.compiler
        target = self.get_target_path()
        if not comp.target_exists(target):
            orig = TemporaryFile()
            if im.mode == "CMYK":
                im = im.convert("RGB")
            im.save(orig, self.format, optimize=True)
            comp.add_file(orig, target)
        for sz in SIZES:
            target = self.get_target_path(sz=sz)
            if not comp.target_exists(target):
                t = im.copy()
                t.thumbnail((sz,sz), Image.BICUBIC)
                f = TemporaryFile()
                t.save(f, self.format, optimize=True)
                comp.add_file(f, target)


    def get_cache_path (self):
        cd = Path(self.cache_dir)
        return cd.joinpath('{}.json'.format(self.basename))


    def get_cached_data (self):
        cp = self.get_cache_path()
        if cp.exists():
            with open(cp.as_posix()) as data_f:
                try:
                    data = json.load(data_f)
                    return data
                except Exception:
                    raise NoCache()
        raise NoCache()


    def save_cached_data (self, data):
        logger.debug('save_cached_data {} {}'.format(self.path, data))
        cp = self.get_cache_path()
        data_str = json.dumps(data, indent=4)
        with open(cp.as_posix(), 'w') as data_f:
            data_f.write(data_str)


    def get_data (self):
        if self.cache_dir:
            try:
                return self.get_cached_data()
            except NoCache:
                pass

        print('+image {}'.format(self.path.as_posix()))

        with Image.open(self.path.as_posix()) as im:
            self.format = im.format
            self.build_images(im)
            data = self.build_data(im)
            if self.cache_dir:
                self.save_cached_data(data)
            return data
