#!/usr/bin/env python

import web
import os
import time
from urllib import quote
import json
import ConfigParser

# load conf file
#cf = ConfigParser.ConfigParser()
#cf.read("conf/server.conf")
#RESOLUTION = eval(cf.get("sec_a","resolution"))
#PREFIX = cf.get("sec_a","url_prefix")

types = [".h",".cpp",".cxx",".cc",".c",".cs",".html",".js",
        ".php",".java",".py",".rb",".as",".jpeg",".jpg",".png",
        ".gif",".ai",".psd",".mp3",".avi",".rmvb",".mp4",".wmv",
        ".mkv",".doc",".docx",".ppt",".pptx",".xls",".xlsx",
        ".zip",".tar",".gz",".7z",".rar",".pdf",".txt",".exe",
	".apk"]
render = web.template.render('template')
root = "/root/upload/"

urls = (
    '/','Index',
    '/download/(.*)',"Download",
    '/favicon.ico',"Ico"
)

class Ico:
    def GET(self):
        return open("static/img/favicon.ico").read()

class Index:
    def GET(self):
        list = []
        item = os.listdir(root)
        item = sorted(item, key = str.lower)
        
        for i in item:
            if i[0] == '.' or os.path.isdir(root + i):
                continue
            temp = {}
            temp['name'] = i
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

    def POST(self):
        x = web.input(file={})
        
        if 'file' in x:
            filepath= x.file.filename.replace('\\','/') # replaces the windows-style slashes with linux ones.
            filename = filepath.split('/')[-1] # splits the and chooses the last part (the filename with extension)
            fout = open(os.path.join(root,filename),'w') # creates the file where the uploaded file should be stored
            fout.write(x.file.file.read()) # writes the uploaded file to the newly created file.
            fout.close() # closes the file, upload complete.
            
        return "<script>parent.location.reload()</script>" 

class Download:
    def GET(self,path):
        web.header('Content-Type','application/octet-stream')
        web.header('Content-disposition', 'attachment; filename=%s' % path)
        file = open(os.path.join(root,path))
        return file.read()

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()


#app = web.application(urls,globals())
#application = app.wsgifunc()
    
