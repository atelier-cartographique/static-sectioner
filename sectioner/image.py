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



import os
from stat import *
from tempfile import TemporaryFile
from hashlib import md5
from pathlib import Path
from PIL import Image
from click import secho
import json


Image.init() # we need this for is_image

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


def is_image (path):
    if path.is_file():
        ext = path.suffix.lower()
        if ext in Image.EXTENSION:
            mime_id = Image.EXTENSION[ext]
            if mime_id in Image.MIME:
                return True
    return False

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

class ImageError(Exception):
    pass

class NoCache(Exception):
    pass

class WebImage:

    def __init__ (self, path, out_dirname, compiler):
        self.path = path
        self.out_dirname = out_dirname
        self.compiler = compiler
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
            secho('processing {}'.format(self.path.as_posix()), fg='blue')
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


    def get_data (self):
        im_path = self.path.as_posix()
        logger.debug('+image {}'.format(im_path))

        if is_image(self.path):
            with Image.open(im_path) as im:
                self.format = im.format
                self.build_images(im)
                data = self.build_data(im)
                return data

        raise ImageError('NotAnImage {}'.format(im_path))
