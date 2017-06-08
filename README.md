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

Then you're all good to install this package.
Note that this package depends on Pillow, which in turn depends on Python development files and few other libraries to install properly, see http://pillow.readthedocs.org/en/latest/installation.html

from the Python Package Index

```bash
pip install sectioner
```

or from this directory

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

### data.xml

Must have a `section` element at its root.

If a `templates-dir` attribute is found on the `section` element, it will take precedence over the default location for templates. 

If a `template-master` attribute is found on the `section` element, it will override default template name (master). 

#### assets

Under `section`, `asset` elements instructs what to copy over target directory, in the form

```xml
<asset>
    <from path="path/relative/to/source" />
    <to path="path/relative/to/target" />
</asset>
```


#### page

Each screen of the website is represented by a `page` element, which have 2 optional attributes:
  - `slug` (takes precedence over the `title` child element)
  - `template` (use this template rather than the default template (relative to templates dir path) and without its ".html" extension)

If a page has an `href` attribute, it's value must be a path to an XML document with a `page` element at its root.

If not told otherwise, the sectioner program will process each page with templates/page.html.

Each child, except the `gallery` element, will be made available to the template associated to this page, in the form `page.tag_name`.

example:

```xml
<page slug="index" template="templates/index">
    <title>Index page</title>
    <content>
    This is your index page...
    you can navigate to <a href="/ex-am-ple.html">Ex Am Ple</a> by pressing KEY_DOWN or wheeling.
    </content>

</page>
```

#### gallery

The special `gallery` element is what the sectioner reads to generate a gallery attached to a page. It looks like:

```xml
<page>
    <gallery root="images">
        <media name="image_0.jpg">
            <caption>
                a caption.
            </caption>
        </media>
        <media name="image_1.jpg">
            <caption>
                another caption
            </caption>
        </media>
    </gallery>
</page>
```

Each `media` element will be processed with the templates/media.html template to produce an HTML fragment which will be attached to what can be selected by `[data-role="media.meta"]` in the page.html template.

Each image is transformed in a collection of target images at different scales to adapt to different device sizes. The process is done only once if images in the build directory are already present.



