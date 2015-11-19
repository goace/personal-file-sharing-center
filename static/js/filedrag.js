/*
filedrag.js - HTML5 File Drag & Drop demonstration
Featured on SitePoint.com
Developed by Craig Buckler (@craigbuckler) of OptimalWorks.net
and Modified by Ace(i.orzace.com)
*/
(function() {

	// getElementById
	function $id(id) {
		return document.getElementById(id);
	}


	// output information
	//function Output(msg) {
		//var m = $id("messages");
		//m.innerHTML = msg + m.innerHTML;
	//}


	// file drag hover
	function FileDragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.target.className = (e.type == "dragover" ? "hover" : "");
	}

    // update the progress bar
 	function uploadProgress(evt) {
        if (evt.lengthComputable) {
            var uploaded = Math.round(evt.loaded * 100 / evt.total);
            $("#upload_progress").show();
            $("#upload_progress_bar").attr("style","width:" + uploaded + "%;")
            //document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
        }
        else {
            //document.getElementById('progressNumber').innerHTML = 'unable to compute';
        }
    }

	// file selection
	function FileSelectHandler(e) {

        // cancel event and hover styling
		FileDragHover(e);

		// fetch FileList object
		var files = e.target.files || e.dataTransfer.files;
        
        // init the ajax request
        var xhr = new XMLHttpRequest();  
        xhr.open('post', document.location.pathname, true);  
        xhr.upload.addEventListener("load", function(e){window.location.reload()},false);
        xhr.upload.addEventListener("progress", uploadProgress, false);

        var formData = new FormData();

		// process all File objects
		for (var i = 0, f; f = files[i]; i++) {
            var entry = e.dataTransfer.items[i].webkitGetAsEntry();
            if(entry.isFile)
                formData.append('file', f);
            else
            {
                alert("不支持上传文件夹");
                return;
            }
            
		}
        
        xhr.send(formData);

	}

	// initialize
	function Init() {

		var fileselect = $id("fileselect"),
			filedrag = $id("filedrag"),
			submitbutton = $id("submitbutton");

		// file select
		fileselect.addEventListener("change", FileSelectHandler, false);

		// is XHR2 available?
		var xhr = new XMLHttpRequest();
		if (xhr.upload) {

			// file drop
			filedrag.addEventListener("dragover", FileDragHover, false);
			filedrag.addEventListener("dragleave", FileDragHover, false);
			filedrag.addEventListener("drop", FileSelectHandler, false);
			filedrag.style.display = "block";

		}

	}

	// call initialization file
	if (window.File && window.FileList && window.FileReader) {
		Init();
	}


})();

function delete_file(obj)
{
    var name = obj.name;
    if(confirm("Delete " + name + ", are you sure?"))
    {
        $.ajax({
            url: document.location.pathname + name,
            type: 'DELETE',
            success: function(data){
                window.location.reload();
            }
        });
    }
    else
        return;
}
