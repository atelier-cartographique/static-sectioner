
from setuptools import setup, find_packages


name = 'sectioner'
package = 'sectioner'
description = 'A site section static builder'
url = 'https://github.com/atelier-cartographique/static-sectioner'
author = 'Pierre Marchand'
author_email = 'pierremarc07@gmail.com'
license = 'Affero GPL3'
classifiers = [
    'Development Status :: 3 - Alpha',
    'Intended Audience :: Developers',
    'Topic :: Software Development :: Build Tools',
    'License :: OSI Approved :: GNU Affero General Public License v3 or later (AGPLv3+)',
    'Operating System :: POSIX',
    'Programming Language :: Python',
    'Programming Language :: Python :: 3.4',
]
install_requires = [
    "click",
    "python-slugify",
    "Pillow",
    "gitpython",
    "inotify"
]
packages = ['sectioner']
package_dir = {'sectioner': 'sectioner'}
package_data = {'sectioner': ['data/*']}
entry_points = {'console_scripts': ['sectioner=sectioner.sectioner:main']}

setup(
    name=name,
    version='0.3.5',
    url=url,
    license=license,
    description=description,
    author=author,
    author_email=author_email,
    packages=packages,
    package_dir=package_dir,
    package_data=package_data,
    install_requires=install_requires,
    classifiers=classifiers,
    entry_points=entry_points
)
