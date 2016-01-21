
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
            attrs_dict[k] = v
            elem += ' {}="{}"'.format(k, v)
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
        self.result('<!-- {} -->'.format(data))

    def handle_entityref(self, name):
        self.result.append(html5[name])

    # def handle_charref(self, name):
    #     if name.startswith('x'):
    #         c = chr(int(name[1:], 16))
    #     else:
    #         c = chr(int(name))
    #     self.result.append(c)

    def handle_decl(self, data):
        self.result.append(data)

    def apply_template (self, template, data):
        self.result = []
        self.template_data = data
        self.feed(template)
        return ''.join(self.result)
