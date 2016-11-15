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


from html.parser import HTMLParser
from html.entities import html5

class TemplateParser(HTMLParser):

    def __init__ (self):
        HTMLParser.__init__(self, convert_charrefs=True)

    def handle_starttag(self, tag, attrs):
        elem = '<{}'.format(tag)
        attrs_dict = dict()
        for attr in attrs:
            k, v = attr
            val = v
            if v.startswith('$'):
                ph = v[1:]
                if ph in self.template_data:
                    val = self.template_data[ph]
            attrs_dict[k] = val
            elem += ' {}="{}"'.format(k, val)
        elem += '>'
        self.result.append(elem)

        if 'data-role' in attrs_dict:
            role = attrs_dict['data-role']
            if role in self.template_data:
                self.result.append(self.template_data[role])

    def handle_endtag(self, tag):
        self.result.append('</{}>'.format(tag))

    def handle_data(self, data):
        self.result.append(data)

    def handle_comment(self, data):
        self.result.append('<!-- {} -->'.format(data))

    def handle_entityref(self, name):
        self.result.append(html5[name])

    def handle_decl(self, data):
        self.result.append('<!{}>'.format(data))

    def apply_template (self, template, data):
        self.result = []
        self.template_data = data
        self.feed(template)
        return ''.join(self.result)
