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

from .parser import TemplateParser


parser = TemplateParser()

def load_template (dirpath, name, required=True):
    home = Path(dirpath)
    template_path = home.joinpath(name + '.html')
    try:
        with template_path.open() as template_file:
            template = template_file.read()
    except Exception as exc:
        if required:
            raise exc
        else:
            return ''
    return template


def apply_template (template, data):
    data_local = dict(data)
    return parser.apply_template(template, data)
