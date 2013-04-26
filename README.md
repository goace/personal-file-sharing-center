# Your Personal File Sharing Center

It's a simple web APP for shareing files with others. It is inspired 
by [SimpleHTTPServer](http://docs.python.org/2/library/simplehttpserver.html) in Python.

## Features
* Cool UI
* HTML5 Drag & Drop
* Uploading Progress Bar
* One Command Start

## Usage
1. [Download the latest release](https://github.com/goace/personal-file-sharing-center/archive/master.zip) or `git clone git://github.com/goace/personal-file-sharing-center.git`
2. Edit `config.py`, set `root` to the directory which you want to share. eg. `root = /home/xxx/center`
3. Create this dir if it doesn't exist. eg. `mkdir /home/xxx/center`
4. Start the daemon: `$ python index.py [port]`
5. Access it from your browser : http://hostname[:port]
6. Enjoy it.

## Advanced
If you want a better perfomence and higher concurrency, you can deploy it with nginx and uwsgi.  

If you have no idea how to set nginx and uwsgi, the following may help...

1. Copy `conf/upload.conf` to the conf path of nginx(maybe /etc/nginx/sites-enaled).
2. Modify `upload.conf` according to your own condition, then reload nginx.
3. Chdir to the root path of my project.
4. Quick start uwsgi: `uwsgi -w index -s :9999` (choose whatever port you like, but must match the setting in upload.conf)
5. or you can [start uwsgi via upstart](http://uwsgi-docs.readthedocs.org/en/latest/Upstart.html). More about [start uwsgi app.](http://uwsgi-docs.readthedocs.org/en/latest/WSGIquickstart.html)

