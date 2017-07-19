#!/usr/bin/env python
#
# sectioner generates a static portfolio website
#
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


import click
from pathlib import Path
import logging
logging.basicConfig()


logger = logging.getLogger('Sectioner')


def clean_path(p):
    return Path(p).absolute().as_posix()


@click.group()
@click.option('--debug/--no-debug', default=False)
def import_command(debug):
    if debug:
        logger.setLevel(logging.DEBUG)
        click.echo('Debug mode is %s' % ('on' if debug else 'off'))


@import_command.command()
@click.argument('name')
def project_new(name):
    from .project import Project
    p = Project(name)
    p.build()


def build_func(indir, outdir, media):
    from .info import Builder
    from .writer import Writer
    from .asset import Compiler
    c = Compiler(indir, outdir)
    b = Builder(indir, outdir, c, media)
    w = Writer(indir, outdir)
    data = b.build()

    index = 0
    for page in data:
        w.write_page(page, index)
        index += 1

    c.run()


@import_command.command()
@click.argument('indir')
@click.argument('outdir')
@click.option('--media/--no-media', default=True)
@click.option('--watch/--no-watch', '-w/-nw', default=False)
def build(indir, outdir, media, watch):
    build_func(indir, outdir, media)

    if watch:
        from inotify.adapters import InotifyTree
        click.secho('Watching {}'.format(indir), fg='blue')
        i = InotifyTree(indir.encode('utf-8'))
        try:
            for event in i.event_gen():
                if event is not None:
                    (header, type_names, watch_path, filename) = event
                    if 'IN_MODIFY' in type_names:
                        build_func(indir, outdir, media)
        except KeyboardInterrupt:
            return


@import_command.command(context_settings=dict(
    ignore_unknown_options=True,
))
@click.argument('gitdir')
@click.option('--port', default=7000)
@click.option('--token')
@click.argument('command', nargs=-1, type=click.UNPROCESSED)
def gitlab_watch(gitdir, port, token, command):
    from .watcher import gitlab_watcher

    logger.info('Local Repository {}'.format(clean_path(gitdir)))
    logger.info('Listening on {}'.format(port))
    logger.info('Command {}'.format(command))

    click.secho('CTRL-C to stop', fg='blue')
    gitlab_watcher(clean_path(gitdir), list(command), port, token)


@import_command.command()
@click.argument('gitdir')
@click.argument('outbase')
@click.option('--port', default=7000)
def http_watch(gitdir, outbase, port):
    from functools import partial
    from .watcher import http_watcher

    logger.info('Local Repository {}'.format(clean_path(gitdir)))
    logger.info('Out Base Dir {}'.format(clean_path(outbase)))
    logger.info('Listening on {}'.format(port))

    click.secho('CTRL-C to stop', fg='blue')
    http_watcher(clean_path(gitdir), clean_path(
        outbase), partial(build_func), port)


def main():
    import_command()

if __name__ == "__main__":
    main()
