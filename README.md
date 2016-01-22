# static-sectioner
A static part-of-a-site generator 


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

```bash
pip install git+https://github.com/atelier-cartographique/static-sectioner.git
```


