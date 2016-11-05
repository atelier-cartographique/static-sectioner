#!/usr/bin/env python
#
# sectioner generates a static portfolio website
#
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


import click
import logging; logging.basicConfig()


log = logging.getLogger('Sectioner')


@click.group()
@click.option('--debug/--no-debug', default=False)
def import_command(debug):
    if debug:
        log.setLevel(logging.DEBUG)
        click.echo('Debug mode is %s' % ('on' if debug else 'off'))


@import_command.command()
@click.argument('name')
def project_new(name):
    from .project import Project
    p = Project(name)
    p.build()

@import_command.command()
@click.argument('indir')
@click.argument('outdir')
@click.option('--cache_dir')
@click.option('--media/--no-media', default=True)
def build(indir, outdir, cache_dir, media):
    from .info import Builder
    from .writer import Writer
    from .asset import Compiler
    c = Compiler(indir, outdir)
    b = Builder(indir, outdir, c, cache_dir, media)
    w = Writer(indir, outdir)
    data = b.build()

    index = 0
    for page in data:
        w.write_page(page, index)
        index += 1

    c.run()


def main ():
    import_command()

if __name__ == "__main__":
    main()
