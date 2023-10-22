// ==UserScript==
// @name         ehentai显示已下载 提取页面元数据
// @namespace    http://tampermonkey.net/
// @version      1.4
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
.showDialog{
      white-space: nowrap;
      position:fixed;
      background-color: #444;
      border-radius: 10px;
      padding:18.7px;
      z-index:99;
      color:#fff;
      left: 50%;
      transform: translate(-50%,0);
      vertical-align: middle;
      display:none;
  }
  .showDialog div
  .right{

  }
  .inputtext{
    width: 400px;
  }
  .pointer{
cursor: pointer;
  }
    `);

    'use strict';
    $("body").prepend("<div class='showDialog'><div><label>端口号<input type='text' class='right inputtext port'></label></div> <br> <div> <label> <span title='点击选择文件路径' class='pointer'>database路径</span> <input type='file' style='display: none;' id='database' name='file'> <input type='text' class='right inputtext databasepath' name=''> </label> </div> <br> <div> <label> <span title='点击选择文件路径' class='pointer'>metabase路径</span> <input type='file' style='display: none;' id='metabase' name='file'> <input type='text' class='right inputtext metadatapath' > </label> </div> <br> <div class='right'> <button class='confim'>保存</button> <button class='close'>关闭</button> </div> </div>");

    $("body").prepend("<a class='setting'></a>");
    $("body").prepend("<div class='copyed'></div>");
    $(".showDialog .close").click(function(){
        $(".showDialog").hide();
    });
    $(".showDialog .confim").click(function(){
        if( ($(".showDialog .databasepath").val()!='')&&($(".showDialog .port").val()!='')&&($(".showDialog .metadatapath").val()!='')){
            if(confirm("要保存当前配置吗？")){
                   setting("del");
                   setting("add");
            }
        }else{
            alert("配置不完整");
        }

    });
    $('#database').change(function() {
        $(".showDialog .databasepath").val(this.value);
    });
    $('#metabase').change(function() {
        $(".showDialog .metadatapath").val(this.value);
    });
    var ehid;
    var url=window.location.href;
    var result_port;
    var result_appAppDatapath;
    var result_metadatapath;
    var metadatapath;
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
        

        };
        store.get("metadatapath").onsuccess = function(event) {
            result_metadatapath = event.target.result;

        };

        transaction.oncomplete = function() {
            //端口路径为空时
            if((result_appAppDatapath==undefined)||(result_port==undefined)||(result_metadatapath==undefined)){
                $(".setting").html("没有设置端口或数据库文件路径，点击设置");
                $(".setting").click(function(){
                    $(".showDialog").show(50);

                });
            }else{
               
                $(".setting").html("已设置端口和数据库路径");

                //删除indexdb
                $(".setting").click(function(){
                    $(".showDialog .databasepath").val(result_appAppDatapath['val']);
                    $(".showDialog .port").val(result_port['val']);
                    $(".showDialog .metadatapath").val(result_metadatapath['val']);
                    $(".showDialog").show();
//                     if(confirm("是否要清空端口和路径")){
//                         setting('del');

//                     }

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
                        data:{
                            appAppDatapath:result_appAppDatapath['val'],
                            metadatapath:result_metadatapath['val'],
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
                        updateSqlite(url,result_appAppDatapath['val'],result_port['val'],result_metadatapath['val'])
                    });
                }
                //e站搜索页面
                if(url.indexOf("hentai.org")!=-1&&$("#toppane").length==1){

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
                        updateSqlite($(this).parent().find("a").attr("href"),result_appAppDatapath['val'],result_port['val'],result_metadatapath['val'])
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
                            result_metadatapath:result_metadatapath['val'],
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
                                        $(this).find(".mark").html("<div style='color:#1c1;text-align: center;'>已下载</div>");
                                        break;
                                    }
                                }
                                //当前页面只有一个搜素结果时自动提取meta
                                if($(".gl1t").length==1&& $(".mark").text()=="未下载"){
                                    $(".mark").focus();
                                    $(".mark").trigger("click");
                                }
                            });
                        },
                        error: function(xhr, status, error) {
                            // 请求失败时的回调函数
                            console.log("请求错误:", error);
                        }
                    });
                    
                }
            }


            console.log('事务已完成');

            // 关闭数据库连接
            db.close();
        };
    };

    //更新数据库
    function updateSqlite(url,appAppDatapath,port,metadatapath){
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
                    metadatapath:metadatapath,
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
                    if(response.indexOf("success")!=-1){
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
                var port = $(".showDialog .port").val();
                var appAppDatapath= $(".showDialog .databasepath").val();
                var metadatapath=$(".showDialog .metadatapath").val();
                const data_port = { name:'port', val: port };
                store.add(data_port);
                const data_appAppDatapath = { name:'appAppDatapath', val: appAppDatapath };
                store.add(data_appAppDatapath);
                const data_metadatapath = { name:'metadatapath', val: metadatapath };
                store.add(data_metadatapath);
            }else if(type=='del'){
                store.delete('port');
                store.delete('appAppDatapath');
                store.delete('metadatapath');
            }
            transaction.oncomplete = function() {
                // 关闭数据库连接

                db.close();
                location.reload();
            };

        }


    }

})();