/*=============================================================================
#     FileName: admin.js
#         Desc: 
#       Author: Ace
#        Email: madaokuan@gmail.com
#     HomePage: http://orzace.com
#      Version: 0.0.1
#   LastChange: 2013-01-30 16:38:06
#      History:
=============================================================================*/
var FE_ADD = "http://x.meepo.org/api"
var AS_ADD = "http://x.meepo.org/as0 "

var MY_SPACE = "MySpace";
var PAGE_SIZE = 20;
var ERR_CODE = {
    "success":0x00000000,
    "meta_token_invalid":0x20000011,
    "account_token_invalid":0x10010001,
}

var local_data;

//type有两种选项：box和msg，分别表示弹出错误框和显示错误代码
function check_error(data,type,$p)
{
    if(data.errCode == ERR_CODE.success)
        return data.errCode;
    if(data.errCode == ERR_CODE.account_token_invalid)
    {
        show_dialog("err","会话过期，请重新登录。")
        flush_local_data();
        window.location.href = "/admin"
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

function flush_local_data()
{
    sessionStorage.clear();
    localStorage.removeItem("admin_data");
}

function show_dialog(type,msg)
{
    alert(msg);
}

$(function()
{
    $('#login_submit').click(login);
})

function login()
{
    var username = $('#username').val();
    var pwd = $('#password').val();
    //pwd = SHA256_hash(pwd);
    
    form = 
    {
        "func":"loginUser",
        "username":username,
        "password":pwd,
        "deviceName":"Web-Console"
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
                local_data.adminname = username;
                local_data.adminid = data.user.id;
                local_data.admintoken = data.accountToken;
                
                sessionStorage.setItem("logging",true);
                localStorage.setItem("admin_data",JSON.stringify(local_data));

                self.location.href = "/admin/home";
            }
        },
        "json"
    );
}

function logout()
{
    flush_local_data();
    self.location.href = "/admin";
}

function search_user()
{
    username = $("#search_user_field").val();
    function genline(data,i,$list)
    {
        var code = '<tr id="' + data.userIdList[i] + '"><td><a href="/admin/user?id='+data.userIdList[i] + '">'  + data.userNameList[i] + '</a></td>' +
            '<td>' + data.userIdList[i] + '</td>' +
            '<td>' + data.userStatusList[i] + '</td>' +
            '<td>' + data.userTypeList[i] + '</td>' +
            '<td><button name="' + data.userIdList[i] + '" onclick="delete_user(this)">删除</button>' + 
            '<button name="' + data.userIdList[i] + '" onclick="enable_user(this)">激活</button>' + 
            '<button name="' + data.userIdList[i] + '" onclick="disable_user(this)">禁用</button></td></tr>';

        $list.append(code);
    }

    $list = $("#user_list");
    $list.empty();
    post_data = 
    {
        "func":"listUsers",
        "userId": local_data.adminid,
        "username":username,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                $("#user_table").show();
                for(var i = 0; i < data.userNameList.length; ++i)
                    genline(data,i,$list);
            }
        },
        "json"
    );

}

function enable_user(obj)
{
    userid = obj.name;

    post_data = 
    {
        "func":"sysEnableUser",
        "userId": local_data.adminid,
        "targetUserId":userid,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;

            search_user();
        },
        "json"
    );
}

function disable_user(obj)
{
    userid = obj.name;

    post_data = 
    {
        "func":"sysDisableUser",
        "userId": local_data.adminid,
        "targetUserId":userid,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;

            search_user();
        },
        "json"
    );
}

function delete_user(obj)
{
    userid = obj.name;

    post_data = 
    {
        "func":"sysRemoveUser",
        "userId": local_data.adminid,
        "targetUserId":userid,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                $("#" + userid).remove();
            }
        },
        "json"
    );
}

function enable_group(obj)
{
    groupid = obj.name;

    post_data = 
    {
        "func":"sysEnableGroup",
        "userId": local_data.adminid,
        "groupId":groupid,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;

            search_group();
        },
        "json"
    );
}

function disable_group(obj)
{
    groupid = obj.name;

    post_data = 
    {
        "func":"sysDisableGroup",
        "userId": local_data.adminid,
        "groupId":groupid,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;

            search_group();
        },
        "json"
    );
}

function delete_group(obj)
{
    groupid = obj.name;

    post_data = 
    {
        "func":"sysRemoveGroup",
        "userId": local_data.adminid,
        "groupId":groupid,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                $("#" + groupid).remove();
            }
        },
        "json"
    );
}

function admin_change_owner(obj)
{
    id = obj.name;
    owner = $("#owner").val();

    post_data = 
    {
        "func":"sysChangeGroupOwner",
        "userId": local_data.adminid,
        "groupId":id,
        "accountToken":local_data.admintoken,
        "targetUserId":owner
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                alert("修改成功");
            }
        },
        "json"
    );
}

function admin_add_group_member()
{
    uid = $("#add_user").val();
    gid = $("#gid").attr("name");

    post_data = 
    {
        "func":"sysAddGroupMember",
        "userId": local_data.adminid,
        "targetGroupId":gid,
        "accountToken":local_data.admintoken,
        "targetUserId":uid
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                alert("添加成功");
                window.location.reload();
            }
        },
        "json"
    );
}
function remove_group_member(obj)
{
    userid = obj.name;
    gid = $("#gid").attr("name");

    post_data = 
    {
        "func":"sysExpelGroupMember",
        "userId": local_data.adminid,
        "targetGroupId":gid,
        "accountToken":local_data.admintoken,
        "targetUserId":userid
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
        
            window.location.reload();
        },
        "json"
    );

}

function list_group_member()
{
    function genline(name,id,$list)
    {
        var code = "<tr><td>" + name  + "</td>" +
            '<td><button name="' + id + '" onclick="remove_group_member(this)" class="btn">删除</button></td></tr>'
        $list.append(code);
    }
    gid = $("#gid").attr("name");

    post_data = 
    {
        "func":"sysListGroupUsers",
        "userId": local_data.adminid,
        "groupId":gid,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            else
            {
                for(var i = 0; i < data.adminIdList.length; ++i)
                    genline(data.adminNameList[i],data.adminIdList[i],$("#admin_list"));
                for(var i = 0; i < data.memberIdList.length; ++i)
                    genline(data.memberNameList[i],data.memberIdList[i],$("#member_list"));
            }
        },
        "json"
    );
}

function admin_change_quota(obj)
{
    id = obj.name;
    quota = $("#quota").val();
    quota *= (1024*1024);

    post_data = 
    {
        "func":"sysSetGroupQuota",
        "userId": local_data.adminid,
        "groupId":id,
        "accountToken":local_data.admintoken,
        "quota":quota
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                alert("修改成功");
            }
        },
        "json"
    );
}

function search_group()
{
    gname = $("#search_group_field").val();
    function genline(data,i,$list)
    {
        if(data.groupNameList[i] == MY_SPACE)
            return;

        var code = '<tr id="' + data.groupIdList[i] + '"><td><a href="/admin/group?id='+data.groupIdList[i] + '">' + data.groupNameList[i] + '</td>' +
            '<td>' + data.groupIdList[i] + '</td>' +
            '<td>' + data.groupStatusList[i] + '</td>' +
            '<td>' + data.groupTypeList[i] + '</td>' +
            '<td><button name="' + data.groupIdList[i] + '" onclick="delete_group(this)">删除</button>' + 
            '<button name="' + data.groupIdList[i] + '" onclick="enable_group(this)">激活</button>' + 
            '<button name="' + data.groupIdList[i] + '" onclick="disable_group(this)">禁用</button></td></tr>';

        $list.append(code);
    }

    $list = $("#group_list");
    $list.empty();
    post_data = 
    {
        "func":"sysLookupGroup",
        "userId": local_data.adminid,
        "groupName":gname,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                $("#group_table").show();
                for(var i = 0; i < data.groupNameList.length; ++i)
                    genline(data,i,$list);
            }
        },
        "json"
    );
}

function admin_set_pwd(obj)
{
    id = obj.name;
    pwd = $("#pwd").val();
    cpwd = $("#check_pwd").val();
    if(pwd != cpwd)
    {
        alert("两次密码不一致");
        return;
    }

    post_data = 
    {
        "func":"sysSetUserPassword",
        "userId": local_data.adminid,
        "accountToken":local_data.admintoken,
        "targetUserId":id,
        "password":pwd
    };
    
    $.post( 
        FE_ADD,
        post_data, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            else
                alert("修改成功！");
        },
        "json"
    );

}


function check_logging()
{
    if(!sessionStorage.logging)
    {
        sessionStorage.clear();
        localStorage.removeItem("admin_data");
        self.location.href = "/admin";
    }
    else
        local_data = JSON.parse(localStorage.admin_data);
}

function approve_group(obj)
{
    groupid = obj.name;

    post_data = 
    {
        "func":"approveGroupEstablishment",
        "userId": local_data.adminid,
        "targetGroupId":groupid,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        AS_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                $("#" + groupid).remove();
            }
        },
        "json"
    );
}

function reject_group(obj)
{
    groupid = obj.name;

    post_data = 
    {
        "func":"rejectGroupEstablishment",
        "userId": local_data.adminid,
        "targetGroupId":groupid,
        "accountToken":local_data.admintoken,
    };
    
    $.post( 
        AS_ADD,
        post_data, 
        function(data)
        {
            var local_data = {};
            if(check_error(data,"box",""))
                return;
            else
            {
                $("#" + groupid).remove();
            }
        },
        "json"
    );
}

function list_pending_groups(p)
{
    function genline(data,i,$list)
    {
        var code = '<tr id="' + data.groupList[i].id + '"><td>' + data.groupList[i].name + '</td>' +
            '<td>' + data.groupList[i].description + '</td>' +
            '<td>' + "unknown" + '</td>' +
            '<td><button name="' + data.groupList[i].id + '" onclick="approve_group(this)">批准</button>' + 
            '<button name="' + data.groupList[i].id + '" onclick="reject_group(this)">拒绝</button></td></tr>';

        $list.append(code);
    }

    $list = $("#pending_group_list");
    post_data = 
    {
        "func":"listNotApprovedGroups",
        "userId": local_data.adminid,
        "accountToken":local_data.admintoken,
        "offset":(p-1)*PAGE_SIZE,
        "count":PAGE_SIZE
    };
    
    $.post( 
        AS_ADD,
        post_data, 
        function(data)
        {
            if(check_error(data,"box",""))
                return;
            else
            {
                for(var i = 0; i < data.groupList.length; ++i)
                    genline(data,i,$list);
            }
        },
        "json"
    );

}

