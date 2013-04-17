/*=============================================================================
#     FileName: api.js
#         Desc: 
#       Author: Ace
#        Email: i@orzace.com
#     HomePage: http://orzace.com
#      Version: 0.0.1
#   LastChange: 2013-02-13 13:13:04
#      History:
=============================================================================*/
//var DOMAIN = "http://" + document.domain;
var DOMAIN = "http://x.meepo.org"
//var MS_ADD = DOMAIN + "/ms"
//var AS_ADD = DOMAIN + "/ms"
var DS_ADD = DOMAIN + "/ds"
var MS_ADD = DOMAIN + "/ms"
var AS_ADD = DOMAIN + "/as0"
var IMG_ADD = "http://img.x.meepo.org/db/"


var local_data;

var MY_SPACE = "的个人空间";   //name of myspace
var QUOTA = 1024*1024*1024; //currently 1G
var MAX_LINE = 40;
var PIC_EVERY_TIME = 5;

var chinese = /[\一-\龥]/;
var invalid_letters = /[:"\<\>\\\/\?\*\|]/;
var blank_string = /^\s+$/;

var ico = {
    //default
    "dir":"/static/img/file-icon/folder.png",
    "general":"/static/img/file-icon/file.png",
    
    //codes
    ".h":"/static/img/file-icon/head.png",
    ".cpp":"/static/img/file-icon/cpp.png",
    ".cxx":"/static/img/file-icon/cpp.png",
    ".cc":"/static/img/file-icon/cpp.png",
    ".c":"/static/img/file-icon/c.png",
    ".cs":"/static/img/file-icon/cs.png",
    ".html":"/static/img/file-icon/html.png",
    ".js":"/static/img/file-icon/js.png",
    ".php":"/static/img/file-icon/php.png",
    ".java":"/static/img/file-icon/java.png",
    ".py":"/static/img/file-icon/py.png",
    ".rb":"/static/img/file-icon/ruby.png",
    ".as":"/static/img/file-icon/as.png",

    //pic
    ".jpeg":"/static/img/file-icon/pic.png",
    ".png":"/static/img/file-icon/pic.png",
    ".jpg":"/static/img/file-icon/pic.png",
    ".gif":"/static/img/file-icon/pic.png",
    ".ai":"/static/img/file-icon/ai.png",
    ".psd":"/static/img/file-icon/psd.png",
    
    //music
    ".mp3":"/static/img/file-icon/music.png",

    //video
    ".avi":"/static/img/file-icon/video.png",
    ".rm":"/static/img/file-icon/video.png",
    ".rmvb":"/static/img/file-icon/video.png",
    ".mp4":"/static/img/file-icon/video.png",
    ".wmv":"/static/img/file-icon/video.png",
    ".mkv":"/static/img/file-icon/video.png",

    //office
    ".doc":"/static/img/file-icon/word.png",
    ".docx":"/static/img/file-icon/word.png",
    ".ppt":"/static/img/file-icon/ppt.png",
    ".pptx":"/static/img/file-icon/ppt.png",
    ".xls":"/static/img/file-icon/excel.png",
    ".xlsx":"/static/img/file-icon/excel.png",

    //zip
    ".rar":"/static/img/file-icon/zip.png",
    ".tar":"/static/img/file-icon/zip.png",
    ".gz":"/static/img/file-icon/zip.png",
    ".7z":"/static/img/file-icon/zip.png",
    ".rar":"/static/img/file-icon/zip.png",

    //else
    ".pdf":"/static/img/file-icon/pdf.png",
    ".txt":"/static/img/file-icon/txt.png",
}

var ERR_CODE = {
    "success":0x00000000,
    "meta_token_invalid":0x10000011,
    "account_token_invalid":0x00000011,
    "entry_not_exists":0x10000102,
}

var GROUP_STATUS = {
    "normal":0,
    "not_approved":1,
    "blocked":2
}

var POSITION = {
    "owner":0,
    "admin":1,
    "assistant":2,
    "member":3,
    "pending":4
}

$(function()
{
    $('#login_submit').click(login);            //登录界面的登录按钮
    $('#reg_submit').click(register);           //登录界面的注册按钮
    $('#logout_button').click(logout);          //所有页面的登出按钮
    $('#change_pwd_submit').click(changepwd);   //所有页面的登出按钮
    
    $('#new_folder_button').click(new_folder);  //主页面的新建文件夹按钮
    //$('#upload_button').click(upload_file);   //主页面的上传文件按钮

    $('#create_group_submit').click(new_group); //新建群组
    $('#delete_from_trash').click(logout);      //永久删除
   
    //Home下"更多操作"下的重命名和删除
    $('#rename_button').click(rename);
    $('#delete_button').click(move_to_trash);

    //所有rel属性位tipsy的标签绑定tooltip行为
    $('[rel=tipsy]').tipsy({gravity: $.fn.tipsy.autoNS, fade: true});
})

/*---internal API---*/
function get_ms_id(id)
{
    return MS_ADD + id;
}

function browse_by_list()
{
    $("#pic_layout").hide();
    $(".table").show();
}

// generate link for pics in the pic-view page
function gen_img_link(i)
{
    var code = "";
    code = '<div class="item"><a href="#" title="' +  decodeURIComponent(pic_name_list[i]) + '" name="' + pic_name_list[i] + '" onclick="download_file(this,0)"><img onload="$canvas.masonry(' + "'reload')" +  '" src="' + IMG_ADD + "0/" + pic_list[i] + '"></img></a></div>' ;
    return code;
}

function more_pic()
{
    if(last_loaded >= pic_list.length - 1)
    {
        //show_dialog("error","没有更多图片了");
        return;
    }
    $canvas = $("#main");
    var i = last_loaded + 1;

    for( ; i < last_loaded + PIC_EVERY_TIME + 1 && i < pic_list.length; ++i)
    {
        //var $item = $('<div class="item"><img onload="$canvas.masonry(' + "'reload')" +  '" src="' + IMG_ADD + "0/" + pic_list[i] + '"></img></div>');
        $canvas.append(gen_img_link(i));
    }


    last_loaded = i - 1;
}

function browse_by_pic()
{
    var first_time_pic = 30; //首次显示30张  后续每次加载5张

    $(".table").hide();
    $canvas = $("#main");
    $("#pic_layout").show();
    
    if(pic_loaded)
        return;

    pic_loaded = true;
    
    var i = 0;
    for( ; i < last_loaded + first_time_pic && i < pic_list.length; ++i)
        $canvas.append(gen_img_link(i));

    last_loaded = i - 1;
    var $container = $('#main');  
        $container.imagesLoaded( function(){  
          $container.masonry({  
            itemSelector : '.item',
            isAnimated: true,
            animationOptions: {
                duration: 200,
                easing: "linear",
            }
          });  
        });  
}

function generate_copy_name(name,i)
{
    var point = name.lastIndexOf(".");
    if(point == -1)
        return name + "(" + i + ")"
    else
        return name.substring(0,point) + "(" + i + ")" + name.substring(point,name.length);
}

//trim routine
function LTrim(str)
{
    var i;
    for(i=0;i<str.length;i++)
    {
        if(str.charAt(i)!=" "&&str.charAt(i)!=" ")break;
    }
    str=str.substring(i,str.length);
    return str;
}

function RTrim(str)
{
    var i;
    for(i=str.length-1;i>=0;i--)
    {
        if(str.charAt(i)!=" "&&str.charAt(i)!=" ")break;
    }
    str=str.substring(0,i+1);
    return str;
}

function Trim(str)
{
    return LTrim(RTrim(str));
}

function get_str_length(str)
{
    var s = str.replace(/[^\x00-\xff]/g, 'xx');
    return s.length;
}

function display_path_bar(url,$p)
{
    segment = url.split("/");
    url = "/" + decodeURIComponent(segment[3]);
    $p.append('<a href="' + url + '">' + segment[3] + "</a>");
    
    for(var i = 4; i < segment.length; ++i)
    {
        url += ("/" + segment[i]);
        $p.append(' <i class="icon-chevron-right"></i><a href="' + url + '"> ' + decodeURIComponent(segment[i]) + "</a>")
    }
}

//trigger to show a button
function show_op(obj)
{
    $tr = $(obj);
    $tr.find('button').show();
}

//trigger to hide a button
function hide_op(obj)
{
    $tr = $(obj);
    $tr.find('button').hide();
}

//clear local storage
function flush_local_data()
{
    sessionStorage.clear();
    localStorage.clear();
}

//error handle routine,
//para: data - return val
//      tpye - message box or text line
//      $p   - optional, the <p> tag for text line
function check_error(data,type,$p)
{
    if(data.errCode == ERR_CODE.success)
        return data.errCode;
    if(data.errCode == ERR_CODE.account_token_invalid)
    {
        show_dialog("err","会话过期，请重新登录。")
        flush_local_data();
        window.location.href = "/login"
        return data.errCode;
    }
    if(data.errCode == ERR_CODE.meta_token_invalid)
    {
        get_meta_token();
        return data.errCode;
    }
    if(type == "box")
        show_dialog("err",data.errMsg);
    else
        show_msg($p,data.errMsg);

    return data.errCode;
}

//show a message box
//TODO: use modal dialog instead of alert
function show_dialog(type, msg)
{
    alert(msg);
}

//display a sentense in a <p>
function show_msg($p,msg)
{
    $p.text(msg).show();
}

//format time display
//para: format - yyyy-MM-dd hh:mm, etc
Date.prototype.format = function(format)
{
    var o = {
    "M+" : this.getMonth()+1,                   //month
    "d+" : this.getDate(),                      //day
    "h+" : this.getHours(),                     //hour
    "m+" : this.getMinutes(),                   //minute
    "s+" : this.getSeconds(),                   //second
    "q+" : Math.floor((this.getMonth()+3)/3),   //quarter
    "S" : this.getMilliseconds()                //millisecond
    }
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
    RegExp.$1.length==1 ? o[k] :
    ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
}

//get the current URL and drop the "#" in the end
function get_url()
{
    var path = window.location.href;
    if(path.charAt(path.length - 1) == "#")
        path = path.substring(0,path.length-1);

    return path;
}

//update the progress bar while uploading file
function update_progress()
{
    $.get(
        "http://x.meepo.org/progress?X-Progress-ID=" + upload_id,
        function(data)
        {
            data = eval(data);
            if(data.state == "starting")
                setTimeout(update_progress,500);
            else if(data.state == "uploading")
            {
                var uploaded = 100 * (data.received / data.size);
                uploaded = uploaded.toFixed(0);
                $("#upload_progress").show();
                $("#upload_progress_bar").attr("style","width:" + uploaded + "%;")
                setTimeout(update_progress,500);
            }
            else
                return;
        }
    )
}

//convert size from Bytes to KB/MB/GB
function tidy_size(size)
{
    if(size <= 1024)
        size += " B";
    else if( size <= 1024*1024)
    {
        size /= 1024;
        size = size.toFixed(2);
        size += " KB";
    }
    else if(size <= 1024*1024*1024) 
    {
        size /= (1024.0*1024);
        size = size.toFixed(2);
        size += " MB";
    }
    else 
    {
        size /= (1024*1024*1024);
        size = size.toFixed(2);
        size += " GB";
    }

    return size;
}
        
function tidy_display_name(name)
{
    var disname;

    if(get_str_length(name) > MAX_LINE)
        disname = name.substring(0,24) + "..." + name.substring(name.length - 11,name.length);
    else
        disname = name;

    return disname;
}

//given a path, split it to groupname & sub-path
//eg: /Movie/asia/2012 -> [ Movie, /asia/2012 ]
function split_path()
{
    var path = $('#path').attr("name");
    var res = {};
    var path_segment = path.split("/");
    res.name = path_segment[1];
    res.path = "";
    for(var i = 2; i < path_segment.length; ++i)
    {
        res.path += '/';
        res.path += path_segment[i];
    }
    //alert(res.path)
    if(res.path == "")
        res.path = "/";
    return res;
}

//check if logged in
function check_logging()
{
    if(!localStorage.logging && !sessionStorage.logging)
    {
        flush_local_data();
        self.location.href = "/";
    }
    else
    {
        local_data = JSON.parse(localStorage.data);
        MY_SPACE = local_data.username + MY_SPACE
    }
}

function ms_add(id)
{
    return MS_ADD + id;
}

/*---Meta Server API---*/
function display_myspace_usage()
{
    if(!local_data.group[MY_SPACE] || local_data.group[MY_SPACE].token == "NULL")
    {
        get_meta_token();
        return;
    }
    var quota = local_data.group[MY_SPACE].quota; 
    var data = {
        "func":"getMeta",
        "user":local_data.userid,
        "metaToken":local_data.group[MY_SPACE].token,
        "root":local_data.userid,
        "path":"/"
    }

    $.post(
        get_ms_id(local_data.group[MY_SPACE].msid),
        data,
        function(data)
        {
            if(check_error(data,"box",""))
                return;
        
            var used = data.meta.size;
            used = (100*used) / quota;
            used = used.toFixed(1);

            var state = "";
            if(used > 60)
                state = "progress-warning";
            if(used > 80)
                state = "progress-danger";

            $("#usage").append("<li><p>您的个人空间已使用" + used + '%</p></li>' + 
                    '<li>0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + quota/1024/1024/1024 + 'G</li>' +
                '<li><div class="progress ' + state + ' progress-striped"><div class="bar" style="width: ' + used + '%;"></div></div></li>'); 
        },
        "json"
    )

}

function list_dir()
{
    //var file_name = $(this).attr("name");
    var url = get_url();
    $path_bar = $("#path_info");
    display_path_bar(url,$path_bar);

    function genline(name,size,time,type)
    {
        dir_list.push(name);
        var disname = tidy_display_name(name);
        if(size != "--")
        {
            size = tidy_size(size);
        }
        time = new Date(time).format("hh:mm yyyy-MM-dd");
        
        var code = '<tr onmouseover="show_op(this)" onmouseout="hide_op(this)">' + 
            '<td><img src="' + ico[type] + '" width="40px" height="32px"></img>';
        if(type == "dir")
            code += '<a title="' + name + '" href="' + get_url() + '/' + encodeURIComponent(name) + '">' + disname + '</td>';
        else if(size != "0 B")
            code += '<a title="' + name + '" href="#" name="' + encodeURIComponent(name) + '" onclick="download_file(this,0,0)">' + disname + '</td>';
        else
            code +=  disname + '</td>';

        code += '<td>' + size + '</td><td>' + time  + '</td>' ;
        code += ('<td><div class="btn-group">' +
            '<button class="btn btn-info btn-mini dropdown-toggle" style="display:none" data-toggle="dropdown"><i class="icon-wrench icon-white"></i>&nbsp;' +  
            '<span class="caret"></span></button><ul class="dropdown-menu">' + 
            '<li><a name="' + name  +  '" href="#" onclick="pre_rename(this)">' + 
            '<i class="icon-repeat"></i>&nbsp;重命名</a></li><li><a href="#" name="' + name + '" onclick="move_to_trash(this)">' + 
            '<i class="icon-trash"></i>&nbsp;删除</a></li>'); 
        
        if(type != "dir")
        {
            var url = get_url();
            var segments = url.split("/");
            var revision_url = "/revision";

            for(var i = 3; i < segments.length; ++i)
            {
                revision_url += '/';
                revision_url += segments[i];
            }
            revision_url += "/" + encodeURIComponent(name);
            code += ('<li><a href="' + revision_url + '"><i class="icon-search"></i> 查看历史版本</a></li>');
        }
            code += '</ul></div></td></tr>';
            
        $table.append(code);
    }
    var path_info = split_path();
    var $table = $("#dir_table");
    
    //alert(path_info.name)
    //alert(path_info.name)
    if(!local_data.group[path_info.name])
        history.go(-1);
        //return;
   
    if(!local_data.group[path_info.name].token == "NULL")
    {
        get_meta_token();
        return;
    }
    //return;
    form = {
        "func":"list",
        "user":local_data.userid,
        "metaToken":local_data.group[path_info.name].token,
        "root":local_data.group[path_info.name].id,
        "path":path_info.path
    }


    $.post(
        get_ms_id(local_data.group[path_info.name].msid),
        form,
        function(data)
        {
            var pic_types = {".jpeg":1,".jpg":1,".png":1};
            var type;
            if(check_error(data,"box",""))
                return;
            for( var i = 0; i < data.metaList.length ;++i)
            {
                if(data.metaList[i].isDirectory)
                {
                    size = "--";
                    type = "dir";
                    genline((data.metaList[i].name),size,data.metaList[i].changeTime,type);
                }
            }
            for( var i = 0; i < data.metaList.length ;++i)
            {
                if(!data.metaList[i].isDirectory)
                {
                    //check if it is a picture
                    if(data.metaList[i].name.indexOf(".") > -1 && pic_types[/\.[^\.]+$/.exec(data.metaList[i].name)[0].toLocaleLowerCase()] == 1 )
                    {
                        pic_list.push(data.metaList[i].pathOnDataStorage);
                        pic_name_list.push(encodeURIComponent(data.metaList[i].name));
                    }

                    size = data.metaList[i].size;
                    if(data.metaList[i].name.indexOf(".") > -1 && ico[/\.[^\.]+$/.exec(data.metaList[i].name)[0].toLocaleLowerCase()])
                        type = /\.[^\.]+$/.exec(data.metaList[i].name)[0].toLocaleLowerCase();
                    else
                        type = "general";

                    genline((data.metaList[i].name),size,data.metaList[i].changeTime,type);
                }
            }
        },
        "json"
    )
}

function new_folder()
{
    var name = $('#new_folder_name').val();
    //alert(name);
    if(dir_list.indexOf(name) > -1)
    {
        $("#new_folder_error").text('该文件（夹）已存在，请另取一个名字').show();
        return;
    }
    if(name == "" || blank_string.test(name))
    {
        $("#new_folder_error").text('名称不能为空').show();
        return;
    }

    if(invalid_letters.test(name))
    {
        $("#new_folder_error").text('名称不能包含下列字符：\\  /  :  *  ?  "  <  >  |').show();
        return;
    }
    var path_info = split_path();
    
    path_info.path += ('/' + name);
    
    form = {
        "func":"makeDirectory",
        "user":local_data.userid,
        "metaToken":local_data.group[path_info.name].token,
        "root":local_data.group[path_info.name].id,
        "path":path_info.path
    }
    
    $.post( 
        get_ms_id(local_data.group[path_info.name].msid),
        form, 
        function(data)
        {
            if(check_error(data,"msg",$("#new_folder_error")))
                return;
                
            window.location.reload();
        },
        "json"
    );
}

function pre_rename(obj)
{
    var old_name = obj.name;
    $("#rename_error").hide();
    $("#rename_name").attr("name",old_name);
    $("#rename_name").val(old_name);
    $("#rename_modal").modal('toggle');
    $("#rename_name").focus();
}

function rename()
{
    var old_name = $('#rename_name').attr("name");
    var name = $('#rename_name').val();
    if(name == "" || blank_string.test(name))
    {
        $("#rename_error").text('名称不能为空').show();
        return;
    }

    if(invalid_letters.test(name))
    {
        $("#rename_error").text('名称不能包含下列字符：\\  /  :  *  ?  "  <  >  |').show();
        return;
    }

    var path_info = split_path();
    var old_path = path_info.path + '/' + old_name;
    var new_path = path_info.path + '/' + name;
    
    form = {
        "func":"move",
        "user":local_data.userid,
        "metaToken":local_data.group[path_info.name].token,
        "root":local_data.group[path_info.name].id,
        "srcPath":old_path,
        "dstPath":new_path
    }
    
    $.post( 
        get_ms_id(local_data.group[path_info.name].msid),
        form, 
        function(data)
        {
            if(check_error(data,"msg",$("#rename_error")))
                return;
                
            window.location.reload();
        },
        "json"
    );
    
}

function move_to_trash(obj)
{
    var name = obj.name;
    var path_info = split_path();
    path_info.path += ('/' + name);
    //alert(path_info.path)

    form = {
        "func":"remove",
        "user":local_data.userid,
        "metaToken":local_data.group[path_info.name].token,
        "root":local_data.group[path_info.name].id,
        "path":path_info.path
    }
    
    $.post( 
        get_ms_id(local_data.group[path_info.name].msid),
        form, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
                
            window.location.reload();
        },
        "json"
    );
}

function list_trash()
{
    //工厂函数，生成对每个group的post请求对应的不同回调函数
    function factory(group_name)
    {
        function handle_data(data)
        {
            var type;
            //alert(data.metaList[0].name);
            if(check_error(data,"box",""))
                return;
            for( var i = 0; i < data.metaList.length ;++i)
            {
                if(data.metaList[i].isDirectory)
                {
                    size = "--";
                    type = "dir";
                }
                else
                {
                    size = data.metaList[i].size;
                    type = "general";
                }
                genline(data.metaList[i].name,group_name,data.metaList[i].changeTime,type);
            }
        }
        return handle_data;
    }

    function genline(name,group_name,time,type)
    {
        var disname = name.substring(0,name.length - 24);
        disname = tidy_display_name(disname);
        var disgname = tidy_display_name(group_name);
        time = new Date(time).format("MM/dd/yyyy hh:mm");
        var code = '<tr onmouseover="show_op(this)" onmouseout="hide_op(this)">' + 
            '<td><img src="' + ico[type] + '" width="25px" height="25px"></img>' + disname + '</td>' +
            '<td>' + disgname + '</td><td>' + time  + '</td>' + 
            '<td><div class="btn-group"><button class="btn btn-info btn-mini" title="' + group_name + 
            '" name="' + name + '" id="delete_from_trash" style="display: none" onclick="delete_from_trash(this)">删除</button>' +
            '<button class="btn btn-info btn-mini" title="' + group_name + 
            '" name="' + name + '" id="restore_from_trash" style="display: none" onclick="restore_from_trash(this)">恢复</button></div></td></tr>';
        $table.append(code);
    }
    
    
    var $table = $("#dir_table");
    form = {
        "func":"listUserGroups",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;
            else
            {
                for(var i = 0; i < data.groupList.length; ++i)
                {
                    gname = data.groupList[i].name;
                    if(data.groupList[i].status != GROUP_STATUS.normal || data.relationList[i].position == POSITION.pending)
                        continue;
                    if(data.groupList[i].id == local_data.userid)
                        gname = MY_SPACE;
                    if(local_data.group[gname].token == "NULL")
                    {
                        get_meta_token();
                        return;
                    }
                    //if(local_data.group[gname] == "NULL" || !local_data.group[gname].token)
                    //{
                        //get_meta_token();
                        //return;
                    //}
                    $("#empty_trash_toggle").append('<li><a href="#" name="' + gname + '" onclick="empty_trash(this)">' + gname + '</a></li>')
                    
                    sub_data = {
                        "func":"listTrash",
                        "user":local_data.userid,
                        "metaToken":local_data.group[gname].token,
                        "root":local_data.group[gname].id,
                        "trashPath":"/"
                    }

                    $.post(
                        get_ms_id(local_data.group[gname].msid),
                        sub_data,
                        factory(gname),
                        "json"
                    )
                }
            }
        },
        "json"
    )
}

function restore_from_trash(obj)
{
    // check if a name is in the dir list
    function has_element(list,name)
    {
        for(var i = 0; i < list.length; ++i)
            if(list[i].name == name)
                return true;

        return false;
    }

    var group_name = obj.title;

    var name = obj.name;
    var dname = name.substring(0,name.length - 24);
    //alert(dname)
    //alert(group_name+name)
    
    
    form = {
        "func":"list",
        "user":local_data.userid,
        "metaToken":local_data.group[group_name].token,
        "root":local_data.group[group_name].id,
        "path":"/"
    }


    $.post(
        get_ms_id(local_data.group[group_name].msid),
        form,
        function(data)
        {
            var count = 0;
            var newname = dname;
    
            while( has_element(data.metaList, newname) )
                newname = generate_copy_name(dname, ++count);
            
            var ms_data = {
                "func":"restore",
                "user":local_data.userid,
                "metaToken":local_data.group[group_name].token,
                "root":local_data.group[group_name].id,
                "trashPath":name,
                "dstPath":newname
            }

            $.post(
                get_ms_id(local_data.group[group_name].msid),
                ms_data,
                function(data)
                {
                    if(check_error(data,"box",""))
                        return;
                        
                    $("#alert_restore_sucess").show();
                    $("#dir_table tr").remove()
                    list_trash();
                },
                "json"
            )
        },
        "json"
    )

}

function delete_from_trash(obj)
{
    
    var group_name = obj.title;

    var name = obj.name;
    //alert(group_name+name)
    form = {
        "func":"delete",
        "user":local_data.userid,
        "metaToken":local_data.group[group_name].token,
        "root":local_data.group[group_name].id,
        "trashPath":name
    }

    $.post(
        get_ms_id(local_data.group[group_name].msid),
        form,
        function(data)
        {
            if(check_error(data,"box",""))
                return;
                
            window.location.reload();
        },
        "json"
    )

}


function empty_trash(obj)
{
    gname = obj.name;

    form = {
        "func":"emptyTrash",
        "user":local_data.userid,
        "metaToken":local_data.group[gname].token,
        "root":local_data.group[gname].id,
    }

    $.post(
        get_ms_id(local_data.group[gname].msid),
        form,
        function(data)
        {
            if(check_error(data,"box",""))
                return;

            window.location.reload();
        },
        "json"
    )
}

function pre_upload()
{
    var path_info = split_path();
    
    form = {
        "func":"requestModification",
        "user":local_data.userid,
        "metaToken":local_data.group[path_info.name].token,
        "root":local_data.group[path_info.name].id,
    }
    
    $.post( 
        get_ms_id(local_data.group[path_info.name].msid),
        form, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            
            dtoken = encodeURIComponent(data.dataToken);
            path = data.pendingModification.pathOnDataStorage;
            mod_id = data.pendingModification.id;
            ds_id = data.pendingModification.dataStorageId;
        
            upload_id = dtoken;
            //var url = "http://x.meepo.org/fs/" + path + "?Z-Token=" + dtoken + "&Z-Size=0&Z-Offset=0&Z-Put=1";
            //var url = "http://166.111.131.146:3200/data/test?Func=write&Data-Offset=0&Data-Size=-1";
            var url = DS_ADD + ds_id + '/' + path + '?Func=write&Data-Offset=0&Data-Size=-1&Data-Token=' + dtoken   + "&X-Progress-ID=" + dtoken;
            $("#upload_form").attr("action",url); 
            $("#mod_id").attr("name",mod_id);
            $("#upload_modal").modal('toggle');
        },
        "json"
    );

}

function commit_modification()
{
    $p = $("#upload_error");
    var res =  $($('#ifm')[0].contentWindow.document.body).text();
    res = JSON.parse(res);

    if(res.filename == "" || !res.filename)
    {
        show_msg($p,"请选择文件");
        return;
    }
    if(res.size == 0)
    {
        show_msg($p,"不允许上传空文件");
        return;
    }
    
    var path_info = split_path();
    var count = 0;
    var newname = res.filename;
    while( dir_list.indexOf(newname) > -1 )
        newname = generate_copy_name(res.filename,++count);
    
    var form = {
        "func":"commitModification",
        "user":local_data.userid,
        "metaToken":local_data.group[path_info.name].token,
        "root":local_data.group[path_info.name].id,
        "modificationId" :  $("#mod_id").attr("name"),
        "path" : path_info.path + "/" + newname, 
        "size" : res.length
    };
    $.post(
        get_ms_id(local_data.group[path_info.name].msid),
        form,
        function(data){
            if(check_error(data,"box",""))
                return;
                
            window.location.reload();
        },
        "json"
    );
    
}

function download_file(obj,version,type)
{
    var name = obj.name;
    name = decodeURIComponent(name);
    var path_info = split_path();
    path_info.path += ('/' + name);
    //alert(path_info.path)

    form = {
        "func":"requestRead",
        "user":local_data.userid,
        "metaToken":local_data.group[path_info.name].token,
        "root":local_data.group[path_info.name].id,
        "path":path_info.path,
        "version":version
    }
    
    if(type == 0)
        var filename = obj.name;
    else
    {
        var seg = $('#path').attr('name').split('/');
        var filename = encodeURIComponent(seg[seg.length - 1]);
    }
    $.post( 
        get_ms_id(local_data.group[path_info.name].msid),
        form, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            else
            {
                name = encodeURIComponent(name);
                var dtoken = data.dataToken;
                dtoken = encodeURIComponent(dtoken);
                var size = data.modification.size;
                var path = data.modification.pathOnDataStorage;
                var dsid = data.modification.dataStorageId;
                var url = DS_ADD + dsid + '/' + path + '?Func=read&File-Name=' + filename + '&Data-Offset=0&Data-Size=' + size + '&Data-Token=' + dtoken; 
                //var url = "http://ds" + dsid + ".x.meepo.org/fs/" + path + "?Z-Token=" + dtoken + "&Z-Size=" + size + "&Z-Offset=0" + "&Z-Name=" + name;
                window.location.href = url;
            }
        },
        "json"
    );
}

function list_history()
{
    var seg = get_url().split('/');
    var file_name = decodeURIComponent(seg[seg.length - 1]);

    function genline(obj,$table)
    {
        var size = tidy_size(obj.size);
        var time = new Date(obj.time).format("hh:mm yyyy-MM-dd");
        var code = "";
        if( size == "0 B")
            code = '<tr><td>版本' + obj.version + '</td>';
        else
            code = '<tr><td><a href="#" onclick="download_file(this,' + obj.version + ',1)">版本' + obj.version + '</a></td>';
        
        code +=  '<td>' + size + '</td>' +
        '<td>' + time + '</td>' +
        '<td><button class="btn btn-info btn-mini" name="' + encodeURIComponent(obj.version) + '" onclick="rollback(this)">回滚</button></td></tr>'; 

        $table.append(code);
    }
    var path_info = split_path();
    var $table = $("#dir_table");

    form = {
        "func":"listHistory",
        "user":local_data.userid,
        "metaToken":local_data.group[path_info.name].token,
        "root":local_data.group[path_info.name].id,
        "path":path_info.path
    }

    $.post(
        get_ms_id(local_data.group[path_info.name].msid),
        form,
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            for( var i = 0; i < data.modificationList.length ;++i)
            {
                genline(data.modificationList[i],$table);
            }
        },
        "json"
    )
}

function rollback(obj)
{
    var path_info = split_path();
    var form = {
        "func":"rollback",
        "user":local_data.userid,
        "metaToken":local_data.group[path_info.name].token,
        "root":local_data.group[path_info.name].id,
        "path":path_info.path,
        "version":obj.name
    }

    $.post(
        get_ms_id(local_data.group[path_info.name].msid),
        form,
        function(data)
        {
            if(check_error(data,"box",""))
                return;
        
            show_dialog("success","回滚成功！");
            window.location.reload();
        },
        "json"
    )
    
}


/*---Account Server API---*/

//metatoken失效的时候重新获取
function get_meta_token()
{
    form = 
    {
        "func":"getMetaTokens",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken
    };
    
    $.post( 
        AS_ADD,
        form,
        function(data)
        {
            if(check_error(data,"box",""))
                return;

            var gname;
            local_data.group = {}
            //alert(data.groupIdList[0]);
            for(var i = 0; i < data.groupList.length; ++i)
            {
                if(data.groupList[i].id == local_data.userid)
                {
                    local_data.group[MY_SPACE] = data.groupList[i];
                    local_data.group[MY_SPACE].msid = data.groupList[i].metaStorageId;
                    local_data.group[MY_SPACE].token = data.metaTokenList[i];
                }
                else
                {
                
                    local_data.group[data.groupList[i].name] = data.groupList[i];
                    local_data.group[data.groupList[i].name].msid = data.groupList[i].metaStorageId;
                    local_data.group[data.groupList[i].name].token = data.metaTokenList[i];
                }
            }
            
            localStorage.setItem("data",JSON.stringify(local_data));
            window.location.reload();
        },
        "json"
    );
    
}

function check_username()
{
    $("#username_error").hide();
    $("#username_success").hide();

    var username = $('#username').val();
    var pattern = /^[a-zA-Z0-9_]{1,}$/;      // 下划线、数字、字母
    var length = [3,20];

    if(!username.match(pattern))
    {
        $("#username_error").text('用户名只能包含下划线、数字和英文字母').show();
        return;
    }

    if(username.length < length[0] || username.length > length[1])
    {
        $("#username_error").text('用户名长度需要在3-20个字符之间').show();
        return;
    }

    form = {
        "func":"existsUser",
        "username":username
    }
    
    $.post( 
        AS_ADD,
        form, 
        function(data)
        {
            if(data.errCode != ERR_CODE.success)
                $("#username_error").text('这个用户名已经被注册过了哦').show();
            else
                $("#username_success").text('OK').show();
        },
        "json"
    );

}

function check_email()
{
    $("#email_error").hide();
    $("#email_success").hide();

    var email = $('#email').val();
    var pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

    if(!email.match(pattern))
    {
        $("#email_error").text('Email的格式好像不对哦').show();
        return;
    }

    form = {
        "func":"existsEmail",
        "email":email
    }
    
    $.post( 
        AS_ADD,
        form, 
        function(data)
        {
            if(data.errCode != ERR_CODE.success)
                $("#email_error").text('这个Email已经被注册过了哦').show();
            else
                $("#email_success").text('OK').show();
        },
        "json"
    );
}

function check_password()
{}

function register()
{
    var username = $('#username').val();
    var email = $('#email').val();
    var pwd = $('#password').val();
    pwd = SHA256_hash(pwd);
    
    form = 
    {
        "func":"registerUser",
        "username":username,
        "password":pwd,
        "email":email,
        "language":1
    };
    
    $.post( 
        AS_ADD,
        form, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
                
            show_dialog("success","恭喜你注册成功！");
            window.location.href = "/login"
        },
        "json"
    );
}

function login()
{
    var username = $('#username').val();
    var pwd = $('#password').val();
    pwd = SHA256_hash(pwd);
    
    form = 
    {
        "func":"loginUser",
        "username":username,
        "password":pwd,
        "deviceName":"Web"
    };
    
    $.post( 
        AS_ADD,
        form, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                //alert(data.accountToken);
                local_data.username = username;
                //local_data.pwd = pwd;
                local_data.userid = data.user.id;
                local_data.accounttoken = data.accountToken;
                local_data.group = {}
                ////alert(data.groupIdList[0]);
                //for(var i = 0; i < data.groupList.length; ++i)
                //{
                    //local_data.group[data.groupList[i].name] = {"id":data.groupList[i].id};
                    ////local_data.group[data.groupNameList[i]].token = data.metaTokenList[i];
                //}
                
                if($("#remember_me").attr("checked"))
                {
                    localStorage.setItem("logging",true);
                    localStorage.setItem("data",JSON.stringify(local_data));
                }
                else
                {
                    sessionStorage.setItem("logging",true);
                    localStorage.setItem("data",JSON.stringify(local_data));
                }

                self.location.href = "/home";
            }
        },
        "json"
    );
}

function forgot_password()
{
    email = $('#forgot_email').val();
    
    form = 
    {
        "func":"forgotUserPassword",
        "email":email,
        "language":1
    };
    
    $.post(
        AS_ADD,
        form, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            else
            {
                $('.form-signin').empty().append("<h3>邮件发送成功</h3><p>我们发送了一封重置密码的邮件到您的邮箱，请注意查收。</p>");
            }
        },
        "json"
    );
}

function check_temp_token()
{
    //var new_pwd = $('#new_pwd').val();
    //var check_pwd = $('#check_new_pwd').val();

    //if(new_pwd != check_pwd)
    //{
        //show_dialog("err","两次输入的密码不一致，请重新输入。");
        //return;
    //}
    //old = SHA256_hash(old);
    //new_pwd = SHA256_hash(new_pwd);

    form = 
    {
        "func":"checkTemporaryToken",
        "userId":user,
        "temporaryToken":token,
    };
    
    $.post(
        AS_ADD,
        form, 
        function(data)
        {
            if(data.errCode != ERR_CODE.success)
            {
                $('#invalid-box').show();
            }
            else
            {
                $('#reset-form').show();
            }
        },
        "json"
    );

      
}

function reset_password()
{
    var new_pwd = $('#new_pwd').val();
    var check_pwd = $('#check_new_pwd').val();

    if(new_pwd != check_pwd)
    {
        show_dialog("err","两次输入的密码不一致，请重新输入。");
        return;
    }
    new_pwd = SHA256_hash(new_pwd);

    form = 
    {
        "func":"resetUserPassword",
        "userId":user,
        "temporaryToken":token,
        "newPassword":new_pwd
    };
    
    $.post(
        AS_ADD,
        form, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            else
            {
                show_dialog("sucess","修改成功，请重新登录。");
                flush_local_data();
                window.location.href = "/login";
            }
        },
        "json"
    );

}

// change user's password
function changepwd()
{
    var old = $("#old_pwd").val();
    var new_pwd = $('#new_pwd').val();
    var check_pwd = $('#check_new_pwd').val();

    if(new_pwd != check_pwd)
    {
        show_dialog("err","两次输入的密码不一致，请重新输入。");
        return;
    }
    old = SHA256_hash(old);
    new_pwd = SHA256_hash(new_pwd);

    form = 
    {
        "func":"changeUserPassword",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "password":old,
        "newPassword":new_pwd
    };
    
    $.post(
        AS_ADD,
        form, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            else
            {
                show_dialog("sucess","修改成功，请重新登录。");
                flush_local_data();
                window.location.href = "/login";
            }
        },
        "json"
    );

}

function logout()
{
    flush_local_data();
    form = {
        "func":"logoutUser",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            self.location.href = "/";
        },
        "json"
    )
    self.location.href = "/";
}

function list_home()
{
    var $table = $("#dir_table");
    var code;
    var url = get_url();
    form = {
        "func":"listUserGroups",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;
            else
            {
                for(var i = 0; i < data.groupList.length; ++i)
                {
                    //var disname = tidy_display_name(data.groupList[i].name);
                    if(data.groupList[i].id != local_data.userid)
                        continue;

                    code = '<tr>' + 
                        '<td><img src="' + ico['dir'] + '" width="25px" height="25px"></img>' + 
                        '<a href="' + url + '/' + encodeURIComponent(MY_SPACE) + '">&nbsp;' + MY_SPACE + '</a></td><td></td>' +
                        '</tr>' 
                    $table.append(code);
                    
                    var gname = MY_SPACE;
                    if( !local_data.group[gname])
                    {
                        local_data.group[gname] = data.groupList[i];
                        //local_data.group[gname]["id"] = data.groupList[i].id;
                        local_data.group[gname]["msid"] = data.groupList[i].metaStorageId;
                        local_data.group[gname]["token"] = "NULL";
                    }
                    break;
                }
                for(var i = 0; i < data.groupList.length; ++i)
                {
                    if(data.groupList[i].status != GROUP_STATUS.normal || data.relationList[i].position == POSITION.pending)
                        continue;
                    
                    var gname = data.groupList[i].name;
                    var disname = tidy_display_name(gname);
                    if(data.groupList[i].id == local_data.userid)
                        continue;
                    
                    if( !local_data.group[gname])
                    {
                        local_data.group[gname] = {};
                        local_data.group[gname]["id"] = data.groupList[i].id;
                        local_data.group[gname]["token"] = "NULL";
                    }
                    //if(!local_data.group[data.groupList[i].name])
                        //local_data.group[data.groupList[i].name] = "NULL"
                    code = '<tr>' + 
                        '<td><img src="' + ico['dir'] + '" width="25px" height="25px"></img>' + 
                        '<a href="' + url + '/' + encodeURIComponent(data.groupList[i].name) + '">&nbsp;' + disname + '</a></td><td></td>' +
                        '</tr>' 
                    $table.append(code);
                }
                localStorage.setItem("data",JSON.stringify(local_data));
            }
        },
        "json"
    )
}

function list_device()
{
    function genline(device,time)
    {
        code = '<tr onmouseover="show_op(this)" onmouseout="hide_op(this)"><td>' +
            '<bold>'+ device.name + '</bold>' + 
            '<td>' + time + '</td>' + 
            '<td>';
        if (name == "Web")
            code += '';  
        else
            code += '<a href="#" name="' + device.id + '" onclick="unlink_device(this)"><i class="icon-remove"></i>&nbsp;下线</a>';
        
        code +=  '</td></tr>'; 
        $table.append(code);
    }
    var $table = $("#dir_table");

    var code;
    form = {
        "func":"listDevices",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;
            
            for(var i = 0; i < data.deviceList.length; ++i)
                genline(data.deviceList[i],new Date(data.deviceList[i].authorizationTime).format("hh:mm yyyy-MM-dd"));
        },
        "json"
    )
}

function unlink_device(obj)
{
    id = obj.name;
    form = {
        "func":"unlinkDevice",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "deviceId":id
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;
                
            window.location.reload();
        },
        "json"
    )
}

//列出用户所有参与的群
function list_group()
{
    var $table = $("#dir_table");
    function genline(name,id,relation)
    {
        if( id == local_data.userid)
            return;
        var disname = tidy_display_name(name);
        var rel;
        if(relation == 0 || relation == 1)
            rel = '<i class="icon-user"></i>';
        else
            rel = '--';
        code = '<tr><td><a href="/group/' + encodeURIComponent(name) + '" name="' + id + '" >' + disname + 
            '</a></td><td>' + rel + '</td></tr>';
        $table.append(code);
    }

    form = {
        "func":"listUserGroups",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;
            for(var i = 0; i < data.groupList.length; ++i)
            {
                if(data.groupList[i].status != GROUP_STATUS.normal || data.relationList[i].position == POSITION.pending)
                    continue;
                
                var gname = data.groupList[i].name;
                if( !local_data.group[gname])
                {
                    local_data.group[gname] = data.groupList[i];
                    //local_data.group[gname] = {};
                    //local_data.group[gname]["id"] = data.groupList[i].id;
                    local_data.group[gname]["msid"] = data.groupList[i].metaStorageId;
                    local_data.group[gname]["token"] = "NULL";
                }

                genline(gname,data.groupList[i].id,data.relationList[i].position);
            }
            
            localStorage.setItem("data",JSON.stringify(local_data));

        },
        "json"
    )
}

function new_group()
{
    var name = $('#create_group_name').val();
    name = Trim(name);
    
    if(name == "" || blank_string.test(name))
    {
        $("#create_group_error").text('名称不能为空').show();
        return;
    }

    if(invalid_letters.test(name))
    {
        $("#create_group_error").text('名称不能包含下列字符：\\  /  :  *  ?  "  <  >  |').show();
        return;
    }

    var des = $('#create_group_des').val();
    form = {
        "func":"establishGroup",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "groupName":name,
        "groupDescription":des,
        "groupTags":JSON.stringify([]),
        "groupType":4
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            
            show_dialog("success","创建成功，请等待管理员的审核。")
            window.location.href = "/group"
        },
        "json"
    )
}

//解散一个群
function delete_group(obj)
{
    var gname = $("#gname").attr("name");
    form = {
        "func":"disbandGroup",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "targetGroupId":local_data.group[gname].id
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;

            window.location.href = "/group";
        },
        "json"
    )

}

//quit a group
function quit_group(obj)
{
    var gname = $("#gname").attr("name");
    form = {
        "func":"quitGroup",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "targetGroupId":local_data.group[gname].id
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;

            window.location.href = "/group";
        },
        "json"
    )

}

//踢出一个用户
function remove_member (obj)
{
    var gname = $("#gname").attr("name");
    form = {
        "func":"expelGroupUser",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "targetUserId":obj.name,
        "targetGroupId":local_data.group[gname].id
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;

            window.location.reload();
        },
        "json"
    )

}

//提拔一个用户为管理员
function promote(obj)
{
    var gname = $("#gname").attr("name");
    form = {
        "func":"changeRelationPosition",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "targetUserId":obj.name,
        "targetGroupId":local_data.group[gname].id,
        "position":POSITION.admin
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;

            window.location.reload();
        },
        "json"
    )

}

//把一个管理员降级为平民
function demote(obj)
{
    var gname = $("#gname").attr("name");
    form = {
        "func":"changeRelationPosition",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "targetUserId":obj.name,
        "targetGroupId":local_data.group[gname].id,
        "position":POSITION.member
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;

            window.location.reload();
        },
        "json"
    )

}

//获取所请求的群的详细信息
function get_group_info()
{
    function genline_pending(username,id,reason,$list)
    {
        var code = "<tr><td>" + username + "</td><td>" + reason + "</td>" +
            '<td><div class="btn-group">' +
            '<button name="' + id + '" onclick="approve(this) " class="btn btn-info btn-small"><i class="icon-ok icon-white"></i></button>' +
            '<button name="' + id + '" onclick="reject(this)" class="btn btn-info btn-small"><i class="icon-remove icon-white"></i></button></div></td></tr>';
        $list.append(code);
    }
    
    function genline(username,id,$list,relation,type)
    {
        var code = "<tr><td>" + username + "</td>";
        if(relation == 0)
        {
            code += '<td><div class="btn-group">';
            if(type=="member")
            {
                code += '<button name="' + id + '" onclick="promote(this) "class="btn btn-info btn-small"><i class="icon-arrow-up icon-white"></i></button>';
                code += '<button name="' + id + '" onclick="remove_member(this)" class="btn btn-info btn-small"><i class="icon-remove icon-white"></i></button></div></td>';
            }
            else
                code += '<button name="' + id + '" onclick="demote(this) "class="btn btn-info btn-small"><i class="icon-arrow-down icon-white"></i></button></div></td>';
        }
        else if (relation == 1)
            if(type=="member")
                code += '<td><button name="' + id + '" onclick="remove_member(this)" class="btn btn-info btn-small"><i class="icon-remove icon-white"></i></button></td>';
        else
            code += "<td></td>";
        code += "</tr>"
        $list.append(code);
    }

    var gname = $("#gname").attr("name");
    var $admin_list = $("#admin_list");
    var $member_list = $("#member_list");
    var $pending_list = $("#pending_list");
    var $g_name = $("#g_name");
    var $des = $("#des");
    var $owner = $("#owner");

    if(!local_data.group[gname])
        history.go(-1);

    form = {
        "func":"listGroupUsers",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "targetGroupId":local_data.group[gname].id
    }

    function is_admin(list)
    {
        for(var i = 0; i < list.length; ++i)
            if(local_data.userid == list[i].id)
                return true;

        return false;
    }


    $.post(
        AS_ADD,
        form,
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            else
            {
                var owner;
                var admin = [];
                var member = [];
                var pending = [];

                for(var i = 0; i < data.userList.length; ++i)
                {
                    if(data.relationList[i].position == POSITION.owner )
                        owner = data.userList[i];
                    else if(data.relationList[i].position == POSITION.admin)
                        admin.push(data.userList[i]);
                    else if(data.relationList[i].position == POSITION.pending)
                        pending.push(data.userList[i]);
                    else
                        member.push(data.userList[i]);
                }

                //检测用户身份
                var relation ;

                if(local_data.userid == owner.id)
                {
                    //it's owner
                    relation = 0;
                    $("#disable_group").show();
                }
                else if(is_admin(admin))
                    //it's admin
                    relation = 1;
                else
                    //it's member
                    relation = 2;
                
                if(relation <= 1)
                    $("#pending_tab").show();
                if(relation != 0)
                    $("#quit_group").show();

                
                if(!local_data.group[gname] || local_data.group[gname].token == "NULL")
                {
                    get_meta_token();
                    return;
                }
                
                var quota = local_data.group[gname].quota; 
                var data = {
                    "func":"getMeta",
                    "user":local_data.userid,
                    "metaToken":local_data.group[gname].token,
                    "root":local_data.group[gname].id,
                    "path":"/"
                }

                $.post(
                    get_ms_id(local_data.group[gname].msid),
                    data,
                    function(data)
                    {
                        if(check_error(data,"box",""))
                            return;
                    
                        var used = data.meta.size;
                        used = (100*used) / quota;
                        used = used.toFixed(1);

                        var state = "";
                        if(used > 60)
                            state = "progress-warning";
                        if(used > 80)
                            state = "progress-danger";

                        $("#gusage").after('<p>' + used + '% (' + quota/1024/1024/1024 + 'G)</p>' + 
                            '<div class="progress ' + state + ' progress-striped"><div class="bar" style="width: ' + used + '%;"></div></div>'); 
                    },
                    "json"
                )
                    
                $g_name.after("<p>" + gname + "</p>");
                $des.after("<p>" +  local_data.group[gname].description + "</p>");
                $owner.after("<p>" + owner.name + "</p>");
                
                for(var i = 0; i < admin.length; ++i)
                    genline(admin[i].name,admin[i].id,$admin_list,relation,"admin");
                
                for(var i = 0; i < member.length; ++i)
                    genline(member[i].name,member[i].id,$member_list,relation,"member");
                
                for(var i = 0; i < pending.length; ++i)
                    genline_pending(pending[i].name,pending[i].id,pending[i].remark,$pending_list);

            }
        },
        "json"
    )

}

// ???
//给定一个群 列出所有请求加入并且未被批准的用户
function list_pending()
{}
//{
    //function genline(username,id,reason,$list)
    //{
        //var code = "<tr><td>" + username + "</td><td>" + reason + "</td>" +
            //'<td><div class="btn-group">' +
            //'<button name="' + id + '" onclick="approve(this) " class="btn btn-info btn-small"><i class="icon-ok icon-white"></i></button>' +
            //'<button name="' + id + '" onclick="reject(this)" class="btn btn-info btn-small"><i class="icon-remove icon-white"></i></button></div></td></tr>';
        //$list.append(code);
    //}
    //var $pending_list = $("#pending_list");
    //$pending_list.empty()
    //var gname = $("#gname").attr("name");
    //data = {
        //"func":"admListPendingGroupJoinings",
        //"userId":local_data.userid,
        //"accountToken":local_data.accounttoken,
        //"groupId":local_data.group[gname].id
    //}

    //$.post(
        //FE_ADD,
        //data,
        //function(data)
        //{
            //if(check_error(data,"box",""))
                //return;
            //else
                //for(var i = 0; i < data.userNameList.length; ++i)
                    //genline(data.userNameList[i],data.userIdList[i],data.reasonList[i],$pending_list);

        //},
        //"json"
    //)
//}

//接受一个用户的加入群请求
function approve(obj)
{
    var gname = $("#gname").attr("name");
    form = {
        "func":"changeRelationPosition",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "targetUserId":obj.name,
        "targetGroupId":local_data.group[gname].id,
        "position":POSITION.member
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;

            window.location.reload();
        },
        "json"
    )

}

//拒绝一个用户的加入群请求
function reject(obj)
{
    var gname = $("#gname").attr("name");
    form = {
        "func":"expelGroupUser",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "targetUserId":obj.name,
        "targetGroupId":local_data.group[gname].id,
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;

            window.location.reload();
        },
        "json"
    )
}

function search_group()
{
    function genline(name,id,$list)
    {
        var disname = tidy_display_name(name);
        var code = "<tr><td>" + disname + "</td>" +
            '<td><button name="' + id + '" class="btn btn-info btn-small" onclick="join_group(this)">' +
            '<i class="icon-plus icon-white"></i></button></td></tr>';
        
        $list.append(code);
    }
    var gname = $("#search_group_field").val();
    
    form = {
        "func":"searchGroupsByName",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "groupName":gname,
        "offset":0,
        "count":100
    }

    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;

            $("#search_group_table").show();
            $('#dir_table').empty();
            for(var i = 0; i < data.groupList.length; ++i)
                genline(data.groupList[i].name,data.groupList[i].id,$("#dir_table"));
        },
        "json"
    )

}

function join_group(obj)
{
    var g_id = obj.name;
    var form = {
        "func":"joinGroup",
        "userId":local_data.userid,
        "accountToken":local_data.accounttoken,
        "targetGroupId":g_id,
        "remark":"auto"
    };
    
    $.post(
        AS_ADD,
        form,
        function(data)
        {
            var code;
            if(check_error(data,"box",""))
                return;

            window.location.reload();
        },
        "json"
    );

}

