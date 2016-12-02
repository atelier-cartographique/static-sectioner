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
from click import secho

class Asset:

    def __init__ (self, source, target):

        self.source_path = source
        self.target_path = target

    def check_dest (self):
        parent = self.target_path.parent
        if parent.exists() == False:
            parent.mkdir(parents=True)

    def target_exists (self):
        return self.target_path.exists()

    def process (self):
        self.check_dest()
        with self.source_path.open('rb') as source:
            with self.target_path.open('wb') as sink:
                sink.write(source.read())
                # secho("[asset] {} {}".format(self.source_path, self.target_path), fg="green")

class FileAsset(Asset):

    def __init__ (self, source, target):
        self.source = source
        self.target_path = target

    def process (self):
        self.check_dest()
        source = self.source
        source.seek(0)
        with self.target_path.open('wb') as sink:
            sink.write(source.read())
            # secho("[asset] <Blob> {}".format(self.target_path), fg="green")

class Compiler:

    def __init__ (self, indir, outdir):
        self.home = Path(indir)
        self.out = Path(outdir)
        self.assets = []

    def target_exists (self, target):
        tp = self.out.joinpath(target)
        return tp.exists()

    def add (self, source, target):
        asset = Asset(
            self.home.joinpath(source),
            self.out.joinpath(target)
        )
        self.assets.append(asset)

    def add_file (self, source, target):
        asset = FileAsset(
            source,
            self.out.joinpath(target)
        )
        # let's do it now and realease the source
        asset.process()

    def run (self):
        for asset in self.assets:
            asset.process()
