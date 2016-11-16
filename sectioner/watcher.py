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


import http.server
from functools import partial
from git import Repo

import logging
logger = logging.getLogger('Sectioner')

class BaseGitlabHandler(http.server.BaseHTTPRequestHandler):

    def gitlab_ok (self):
        self.send_response(200, message="OK")
        self.end_headers()

    def gitlab_not_ok (self):
        self.send_response(403, message="NOT OK")
        self.end_headers()

    def do_POST (self):
        if self.token != None:
            req_tok = self.headers['X-Gitlab-Token']
            if req_tok != self.token:
                return self.gitlab_not_ok()

        self.gitlab_ok()
        if self.updater():
            try:
                self.builder()
                logger.info('Project Built')
            except Exception as ex:
                logger.error('Project Not Built {}'.format(ex))



def updater (repo):
    try:
        # output = subprocess.check_output(['git', 'pull', '-C', gitdir])
        # logger.debug('updater {}'.format(output))
        origin = repo.remotes.origin
        origin.pull()
    except Exception as ex:
        logger.error('updater {}'.format(ex))
        return False
    return True

def gitlab_watcher (gitdir, builder, port, token):
    GITLAB_TOKEN = token
    repo = Repo(gitdir)
    Handler = type('GitlabHandler', (BaseGitlabHandler,),
                   dict(builder=builder,
                        updater=partial(updater, repo),
                        token=token))
    httpd = http.server.HTTPServer(('', port), Handler)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()
