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


from os import walk
from pathlib import Path
from click import secho


class Asset:

    def __init__(self, home, out, source, target):
        self.home = home
        self.out = out
        self.source_path = home.joinpath(source)
        self.target_path = out.joinpath(target)

    def check_dest(self):
        parent = self.target_path.parent
        if parent.exists() == False:
            parent.mkdir(parents=True)

    def target_exists(self):
        return self.target_path.exists()

    def process_file(self):
        with self.source_path.open('rb') as source:
            with self.target_path.open('wb') as sink:
                sink.write(source.read())

    def rm_dir(self, path):
        for root, dirs, files in walk(path.as_posix(), topdown=False):
            for f in files:
                Path(root).joinpath(f).unlink()
            for d in dirs:
                Path(root).joinpath(d).rmdir()
        path.rmdir()

    def copy_dir(self, s, t):
        for p in s.iterdir():
            fp = p.relative_to(self.source_path)
            tp = t.joinpath(fp)
            if p.is_dir() and (tp.exists() == False):
                self.copy_dir(p, t)
            else:
                if tp.parent.exists() == False:
                    tp.parent.mkdir(parents=True)
                with p.open('rb') as source:
                    with tp.open('wb') as sink:
                        sink.write(source.read())

    def process_dir(self):
        source = self.source_path
        target = self.target_path
        if self.target_exists():
            self.rm_dir(target)
        target.mkdir()

        self.copy_dir(source, target)

        # for root, dirs, files in walk(source.as_posix()):
        #     for d in dirs:
        #         target.joinpath(root, d).mkdir()
        #     for f in files:
        # print('{} # {} # {}'.format(source, root, f))
        #         with Path(root).joinpath(f).open('rb') as source:
        # print('{} # {} # {}'.format(target, root, f))
        #             with target.joinpath(root, f).open('wb') as sink:
        #                 sink.write(source.read())

    def process(self):
        self.check_dest()
        if self.source_path.is_dir():
            self.process_dir()
        else:
            self.process_file()


class FileAsset(Asset):

    def __init__(self, source, target):
        self.source = source
        self.target_path = target

    def process(self):
        self.check_dest()
        source = self.source
        source.seek(0)
        with self.target_path.open('wb') as sink:
            sink.write(source.read())
            # secho("[asset] <Blob> {}".format(self.target_path), fg="green")


class Compiler:

    def __init__(self, indir, outdir):
        self.home = Path(indir)
        self.out = Path(outdir)
        self.assets = []

    def target_exists(self, target):
        tp = self.out.joinpath(target)
        return tp.exists()

    def add(self, source, target):
        asset = Asset(
            self.home,
            self.out,
            source,
            target
        )
        self.assets.append(asset)

    def add_file(self, source, target):
        asset = FileAsset(
            source,
            self.out.joinpath(target)
        )
        # let's do it now and realease the source
        asset.process()

    def run(self):
        for asset in self.assets:
            asset.process()
