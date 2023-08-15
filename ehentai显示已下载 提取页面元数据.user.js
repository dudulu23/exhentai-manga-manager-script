// ==UserScript==
// @name         ehentai显示已下载 提取页面元数据
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  try to take over the world!
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
  content: "点击提取元数据";
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
    //端口修改
    var port=8080;
    var ehid;

    var url=window.location.href;
    $("body").prepend("<div class='copyed'>元数据已复制到剪切板</div>");
    if(url.indexOf("hentai.org/g/")!=-1){
        //详情页显示
        $("#taglist").append("<div class='mark'><div style='color:#999;text-align: center;'>未连接</div></div>");
        $(".mark").click(function(){
            copymeta(url);
        });
        ehid='["/'+url.split("/")[4]+'/"]';
        $.ajax({
            url: "http://localhost:"+port+"/data.php",  // 请求的URL
            method: "POST",  // 请求方法，可选项包括 "GET", "POST", "PUT", "DELETE" 等.
            data: ehid,  // 请求参数，如果不需要传递参数可以省略
            success: function(response) {
                response = eval(response)[0];
                if(ehid.indexOf(response)!=-1){
                    $(".mark").html("<div style='color:#1b1;text-align: center;'>已下载</div>");

                }else{
                    $(".mark").html("<div style='color:#999;text-align: center;'>未下载</div>");
                }

            },
            error: function(xhr, status, error) {
                // 请求失败时的回调函数
                console.log("请求错误:", error);
            }
        });
    }else{
        //缩略图页面显示



        ehid=[];
        //右键清空搜索栏
        $("#f_search").contextmenu(function(){
            $("#f_search").val("");
        });
        //搜索栏文字调整
        $("#f_search").change(function(){
            var kw=$("#f_search").val();
            kw=kw.replace(/\(.*?\)/g,'');
            kw=kw.replaceAll('~','');
            kw=kw.replace('.zip','');
            if(!isNaN(kw.substring(0,kw.indexOf("-")))){
                kw=kw.substring(kw.indexOf("-")+1,kw.length);
            }
            $("#f_search").val(kw);
            //失焦后点击搜索
            $("#f_search").next().trigger("click");
        });
        $(".gl1t").append("<div class='mark'><div style='color:#999;text-align: center;'>未连接</div></div>");
        $(".mark").click(function(){
            copymeta($(this).parent().find("a").attr("href"));
        });
        $(".gl1t").each(function(){
            var ehurl=$(this).find("a").attr("href");
            ehurl=ehurl.split("/");
            ehid.push("/"+ehurl[4]+"/");
        });
        $.ajax({
            url: "http://localhost:"+port+"/data.php",  // 请求的URL
            method: "POST",  // 请求方法，可选项包括 "GET", "POST", "PUT", "DELETE" 等.
            data: JSON.stringify(ehid),  // 请求参数，如果不需要传递参数可以省略
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
        if($(".gl1t").length==1){
            $(".mark").focus();
            $(".mark").trigger("click");
        }
    }

    function copymeta(url){
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
            navigator.clipboard.writeText(JSON.stringify(metaobj))
            $('.copyed').fadeIn(); // 元素开始时显示

            setTimeout(function() {
                $('.copyed').fadeOut(); // 5秒后元素消失
            }, 2000);

        })

    }
})();