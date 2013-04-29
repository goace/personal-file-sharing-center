# the directory you want to share
import os
root = os.path.join(os.getcwd(), "upload/")
if not os.path.isdir(root):
    os.makedirs(root)
