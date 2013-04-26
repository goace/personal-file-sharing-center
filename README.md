# Your Personal File Sharing Center

It's a simple web APP for shareing files with others. It is inspired 
by [SimpleHTTPServer](http://docs.python.org/2/library/simplehttpserver.html) in Python.

## Usage
1. [Download the latest release.](https://github.com/goace/personal-file-sharing-center/archive/master.zip)
2. Edit config.py, set `root` to the directory which you want to share. eg. `root = /home/xxx/center`
3. Create this dir if it doesn't exist. eg. `mkdir /home/xxx/center`
4. Start the daemon: `$ python index.py [port]`
5. Access it from your browser : http://hostname[:port]
6. Enjoy it.
