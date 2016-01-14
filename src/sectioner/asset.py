

from pathlib import Path
from click import secho

class Asset:

    def __init__ (self, source, target, processor):

        self.source_path = source
        self.target_path = target
        self.processor = processor

    def check_dest (self):
        parent = self.target_path.parent
        if parent.exists() == False:
            parent.mkdir(parents=True)

    def copy (self):
        self.check_dest()
        with self.source_path.open('rb') as source:
            with self.target_path.open('wb') as sink:
                sink.write(source.read())
                secho("[asset] {} {}".format(self.source_path, self.target_path), fg="green")

    def process_write (self):
        with self.source_path.open('rb') as source:
            data = source.read()
            out = self.processor(data)
            self.check_dest()
            with self.target_path.open('wb') as sink:
                sink.write(out)
                secho("[asset] {} {}".format(self.source_path, self.target_path), fg="green")

    def process (self):
        if self.processor:
            self.process_write()
        else:
            self.copy()


class Compiler:

    def __init__ (self, indir, outdir):
        self.home = Path(indir)
        self.out = Path(outdir)

        self.processors = dict()
        self.assets = []

    def register_processor (self, name, method):
        self.processors[name] = method

    def add (self, source, target, processor=None):
        asset = Asset(
            self.home.joinpath(source),
            self.out.joinpath(target),
            processor
        )
        self.assets.append(asset)


    def run (self):
        for asset in self.assets:
            asset.process()
