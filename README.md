# static-sectioner
Sectioner is a hacky portfolio generator.
It is suitable for static websites, that are updated once a while, with consequent updates.
It is not suitable for blog like website, agendas, etc...


## Requirements

- python 3


## Install

At first, you might want to setup a virtual environment with and activate it:

```bash
virtualenv -p python3 venv
. venv/bin/activate
```

It's usually a good idea to update this environment:

```bash
pip install -U pip
```

Then you're all good to install this package, which, at the moment is not yet publish on
the Python Package Index.
Note that this package depends on Pillow, which in turn depends on Python development files and few other libraries to install properly, see http://pillow.readthedocs.org/en/latest/installation.html

From this directory

```bash
python setup.py install
```
or from a distance

```bash
pip install git+https://github.com/atelier-cartographique/static-sectioner.git
```


## Quick start

You can start a new project with the `project_new` command:

```bash
sectioner project_new my-project
```

Which should results in the following tree:

```
my-project
├── data.xml
├── images
│   ├── image_0.jpg
│   └── image_1.jpg
├── js
│   ├── lodash.js
│   ├── sectioner.js
│   ├── velocity.js
│   └── zepto.js
├── pages
│   └── example.xml
├── styles
│   └── styles.css
└── templates
    ├── index.html
    ├── master.html
    ├── media.html
    └── page.html
```
Then generate the website with the `build` command:

```bash
sectioner build my-project my-build
```

To get a full overview of the generated website, you can run the simple HTTP server provided by Python's standard library:

```bash
cd my-build && python -m http.server 8000
```

The example project should be visible at [http://localhost:8000](http://localhost:8000)


## Pieces of documentation
