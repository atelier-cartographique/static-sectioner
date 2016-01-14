#!/usr/bin/env python
# -*- coding: utf-8 -*-

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
    from project import Project
    p = Project(name)
    p.build()

@import_command.command()
@click.argument('indir')
@click.argument('outdir')
def build(indir, outdir):
    from info import Builder
    from writer import Writer
    from asset import Compiler
    c = Compiler(indir, outdir)
    b = Builder(indir, outdir, c)
    w = Writer(indir, outdir)
    data = b.build()

    for index in range(len(data)):
        w.write_page(index, data)

    c.run()

if __name__ == "__main__":
    import_command()
