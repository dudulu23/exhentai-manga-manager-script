// ==UserScript==
// @name         ehentai显示已下载 提取页面元数据
// @namespace    http://tampermonkey.net/
// @version      1.3
// @license      MIT
// @description  exhentai-manga-manager的附加浏览器脚本
// @author       You
// @match        *exhentai.org/*
// @match        *e-hentai.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=exhentai.org
// @grant        GM_addStyle
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// ==/UserScript==

(function() {
    GM_addStyle(`

.mark {
  cursor:pointer;
  position: relative;
  background:rgba(0, 0, 0, 0.1);
}

.mark::before {
text-align: center;
  content: "点击录入元数据";
  position: absolute;
  width:100px;
  top: -5px;
  left: 50%;
  transform: translate(-50%,0);
  padding: 5px;
  background-color: #444;
  color: #fff;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  border-radius: 5px;
}

.mark:hover::before {
  opacity: 1;
  visibility: visible;
}
.copyed{
    font-size:30px;
    position:fixed;
    left: 50%;
    top:100px;
    transform: translate(-50%,0);
    z-index:99;
    padding:10px;
    background-color: #444;
    border-radius: 10px;
    display:none;
    color:#fff;

}
    `);

    'use strict';
    $("body").prepend("<a class='setting'></a>");
    $("body").prepend("<div class='copyed'></div>");
    var ehid;
    var url=window.location.href;
    var result_port;
    var result_appAppDatapath;
    const request = indexedDB.open('ex1', 1);
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        //  检查对象存储空间是否存在
        if (!db.objectStoreNames.contains('setting')) {

            // 创建对象存储空间
            const objectStore = db.createObjectStore('setting', { keyPath: 'name' });
        }
    };
    request.onsuccess = function(event) {
        const db = event.target.result;

        // 开始事务（读写模式）
        const transaction = db.transaction(['setting'], 'readwrite');

        // 获取对象存储空间
        const store = transaction.objectStore('setting');
        // 获取数据
        store.get("appAppDatapath").onsuccess = function(event) {
            result_appAppDatapath = event.target.result;

        };

        store.get("port").onsuccess = function(event) {
            result_port = event.target.result;
            console.log(result_port);

        };


        transaction.oncomplete = function() {
            //数据库为空时
            if((result_appAppDatapath==undefined)||(result_port==undefined)){
                $(".setting").html("没有设置端口或数据库文件路径，点击设置");
                $(".setting").click(function(){
                    setting('add');

                });
            }else{
                $(".setting").html("已设置端口和数据库路径");
                //删除indexdb
                $(".setting").click(function(){
                    if(confirm("是否要清空端口和路径")){
                        setting('del');

                    }

                });
                //主功能开始
                //漫画详细页
                if(url.indexOf("hentai.org/g/")!=-1){
                    //详情页显示
                    $("#taglist").append("<div class='mark'><div style='color:#999;text-align: center;'>未连接</div></div>");
                    //获取当前uid
                    ehid='["/'+url.split("/")[4]+'/"]';
                    //显示有没有下载
                    $.ajax({
                        url: "http://localhost:"+result_port['val']+"/data.php",  // 请求的URL
                        method: "POST",  // 请求方法，可选项包括 "GET", "POST", "PUT", "DELETE" 等.
                        dataType:'json',
                        data:{
                            appAppDatapath:result_appAppDatapath['val'],
                            ehid:ehid,
                            fun:'showDownload'
                        },  // 请求参数，如果不需要传递参数可以省略
                        success: function(response) {
                            response = eval(response)[0];
                            if(ehid.indexOf(response)!=-1){
                                $(".mark").html("<div style='color:#1b1;text-align: center;'>已下载</div>");

                            }else{
                                $(".mark").html("<div style='color:#999;text-align: center;'>未下载</div>");
                            }
                        },
                        error: function(xhr, status, error) {
                            console.log("请求错误:", error);
                        }
                    });
                    //点击后添加到数据库
                    $(".mark").click(function(){
                        updateSqlite(url,result_appAppDatapath['val'],result_port['val'])
                    });
                }
                //e站搜索页面
                if(url.indexOf("hentai.org/?f_search")!=-1){
                    ehid=[];
                    $("#f_search").contextmenu(function(){
                        $("#f_search").val("");
                    });
                    //格式化搜索框内的内容
                    $("#f_search").change(function(){
                        var kw=$("#f_search").val();
                        kw=kw.replace(/\(.*?\)/g,'');
                        kw=kw.replaceAll('~','');
                        kw=kw.replace('.zip','');
                        if(!isNaN(kw.substring(0,kw.indexOf("-")))){
                            kw=kw.substring(kw.indexOf("-")+1,kw.length);
                        }
                        $("#f_search").val(kw);
                        $("#f_search").next().trigger("click");
                    });
                    $(".gl1t").append("<div class='mark'><div style='color:#999;text-align: center;'>未连接</div></div>");
                    $(".mark").click(function(){
                        updateSqlite($(this).parent().find("a").attr("href"),result_appAppDatapath['val'],result_port['val'])
                    });
                    $(".gl1t").each(function(){
                        var ehurl=$(this).find("a").attr("href");
                        ehurl=ehurl.split("/");
                        ehid.push("/"+ehurl[4]+"/");
                    });
                    $.ajax({
                        url: "http://localhost:"+result_port['val']+"/data.php",  // 请求的URL
                        method: "POST",  // 请求方法，可选项包括 "GET", "POST", "PUT", "DELETE" 等.
                        data: {
                            appAppDatapath:result_appAppDatapath['val'],
                            ehid:JSON.stringify(ehid),
                            fun:'showDownload'
                        },  // 请求参数，如果不需要传递参数可以省略
                        success: function(response){
                            //转为对象
                            var back_obj = eval(response);
                            $(".mark").html("<div style='color:#999;text-align: center;'>未下载</div>");
                            //遍历网址
                            $(".gl1t").each(function(){
                                //遍历返回的对象
                                for(let i=0;i<back_obj.length;i++){
                                    if($(this).find("a").attr("href").indexOf(back_obj[i])!=-1){
                                        $(this).find(".mark").html("<div style='color:#1c1;text-align: center;'>已下载</div>")
                                        break;
                                    }
                                }
                            });
                        },
                        error: function(xhr, status, error) {
                            // 请求失败时的回调函数
                            console.log("请求错误:", error);
                        }
                    });
                    //当前页面只有一个搜素结果时自动提取meta
                    if($(".gl1t").length==1&&($(".mark").html()=="未下载")){
                        $(".mark").focus();
                        $(".mark").trigger("click");
                    }
                }
            }


            console.log('事务已完成');

            // 关闭数据库连接
            db.close();
        };
    };

    //更新数据库
    function updateSqlite(url,appAppDatapath,port){
        //获取元数据
        let match = /(\d+)\/([a-z0-9]+)/.exec(url)
        fetch('https://api.e-hentai.org/api.php', {
            method: "POST",
            body: JSON.stringify({
                'method': 'gdata',
                'gidlist': [
                    [+match[1], match[2]]
                ],
                'namespace': 1
            })
        })
            .then(async res => {
            let metaobj = {}
            let gmetadata = await res.json()
            gmetadata = gmetadata.gmetadata[0]
            let tags = {}
            gmetadata.tags.forEach(tagString => {
                let match = /^(.+):(.+)$/.exec(tagString)
                if (tags[match[1]]) {
                    tags[match[1]].push(match[2])
                } else {
                    tags[match[1]] = [match[2]]
                }
            })
            metaobj.tags = tags
            metaobj.url = url
            metaobj.title = gmetadata.title
            metaobj.title_jpn = gmetadata.title_jpn
            metaobj.rating = +gmetadata.rating
            metaobj.posted = +gmetadata.posted
            metaobj.filecount = +gmetadata.filecount
            metaobj.category = gmetadata.category
            metaobj.filesize = gmetadata.filesize
            metaobj.status = 'tagged'
            var gid=gmetadata.gid
            //连接data.php
            //三次搜索，用gid搜索文件夹名，主要用于ehviewer下载的文件中所带的gid号，用日文搜索文件名，用英文搜索文件名
            $.ajax({
                url: "http://localhost:"+port+"/data.php",  // 请求的URL
                method: "POST",
                data:{
                    appAppDatapath:appAppDatapath,
                    gid:gid,
                    metaobj:JSON.stringify(metaobj),
                    fun:'updateDatabase'
                },  // 请求参数，如果不需要传递参数可以省略
                success: function(response) {
                    //无搜索结果时使用手动输入
                    if(response.indexOf("notfind")!=-1){
                       //复制
                        navigator.clipboard.writeText(JSON.stringify(metaobj));
                        $(".copyed").text("录入失败，请手动录入元数据，元数据已复制到剪切版");
                    }
                    if(response.indexOf("succsee")!=-1){
                        $(".copyed").text("录入成功");
                    }
                    $('.copyed').fadeIn(); // 元素开始时显示
                    setTimeout(function() {
                        $('.copyed').fadeOut(); // 5秒后元素消失
                    }, 2000);
                },
                error: function(xhr, status, error) {
                    console.log("请求错误:", error);
                }
            });

        })



    }
    //设置端口和文件路径
    function setting(type){
        const request = indexedDB.open('ex1', 1);
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            //  检查对象存储空间是否存在
            if (!db.objectStoreNames.contains('setting')) {
                // 创建对象存储空间
                const objectStore = db.createObjectStore('setting', { keyPath: 'name' });
            }
        };
        request.onsuccess = function(event) {
            const db = event.target.result;

            // 开始事务（读写模式）
            const transaction = db.transaction(['setting'], 'readwrite');

            // 获取对象存储空间
            const store = transaction.objectStore('setting');
            if(type=='add'){
                var port = prompt('请输入php服务端口号');
                var appAppDatapath= prompt('请输入database.sqlite的路径         安装版exhentai-manga-manager的数据库文件一般在     C:\\Users\\用户名\\AppData\\Roaming\\exhentai-manga-manager下');
                const data_port = { name:'port', val: port };
                store.add(data_port);
                const data_appAppDatapath = { name:'appAppDatapath', val: appAppDatapath };
                store.add(data_appAppDatapath);
            }else if(type=='del'){
                store.delete('port');
                store.delete('appAppDatapath');
            }
            transaction.oncomplete = function() {
                // 关闭数据库连接

                db.close();
                location.reload();
            };

        }


    }

})();