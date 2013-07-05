#!/usr/bin/env python
import web
import os
import time
import config
from urllib import quote

# load config file
root = config.root

types = [
    ".h",".cpp",".cxx",".cc",".c",".cs",".html",".js",
    ".php",".java",".py",".rb",".as",".jpeg",".jpg",".png",
    ".gif",".ai",".psd",".mp3",".avi",".rmvb",".mp4",".wmv",
    ".mkv",".doc",".docx",".ppt",".pptx",".xls",".xlsx",
    ".zip",".tar",".gz",".7z",".rar",".pdf",".txt",".exe",
    ".apk"
]

render = web.template.render('template')

urls = (
    '/favicon.ico',"Ico",
    '/(.*)','Index',
)

class Ico:
    def GET(self):
        return open("static/img/favicon.ico").read()

class Index:
    def GET(self,path):
        if path == '':
            list = []
            item = os.listdir(root)
            item = sorted(item, key = str.lower)
            
            for i in item:
                if i[0] == '.' or os.path.isdir(root + i):
                    continue
                temp = {}
                temp['name'] = unicode(i, "gbk")
                temp['type'] = '.' + i.split('.')[-1]
                
                try:
                    types.index(temp['type'])
                except:
                    temp['type'] = "general"


                temp["time"] = time.strftime("%H:%M:%S %Y-%m-%d",
                        time.localtime(os.path.getmtime(root + i))) 
                
                size = os.path.getsize(os.path.join(root,i))
                if size < 1024:
                    size = str(size) + ".0 B"
                elif size < 1024 * 1024:
                    size = "%0.1f KB" % (size/1024.0)
                elif size < 1024 * 1024 * 1024:
                    size = "%0.1f MB" % (size/1024.0/1024.0)
                else :
                    size = "%0.1f GB" % (size/1024.0/1024.0/1024.0)
                
                temp["size"] = size
                temp["encode"] = quote(i)

                list.append(temp)
            
            return render.layout(list) 
        
        else:
            web.header('Content-Type','application/octet-stream')
            web.header('Content-disposition', 'attachment; filename=%s' % path)
            file = open(os.path.join(root,path))
            size = os.path.getsize(os.path.join(root,path))
            web.header('Content-Length','%s' % size)
            return file.read()
            
    def DELETE(self,filename):
        try:
            os.remove(os.path.join(root,filename))
        except:
            return "success" 


    def POST(self,filename):
        x = web.input(file={})
        #print x
        
        if 'file' in x:
            filepath= x.file.filename.replace('\\','/')     # replaces the windows-style slashes with linux ones.
            filename = filepath.split('/')[-1]              # splits the and chooses the last part (the filename with extension)
            filename = unicode(filename, "utf8")
			fout = open(os.path.join(root,filename),'w')    # creates the file where the uploaded file should be stored
            fout.write(x.file.file.read())                  # writes the uploaded file to the newly created file.
            fout.close()                                    # closes the file, upload complete.
            
        return "<script>parent.location.reload()</script>" 

#if __name__ == "__main__":
#    app = web.application(urls, globals())
#    app.run()

# to work with uwsgi, uncomment the follwing two lines
app = web.application(urls,globals())
application = app.wsgifunc()

if __name__ == "__main__":
    app.run()
    
