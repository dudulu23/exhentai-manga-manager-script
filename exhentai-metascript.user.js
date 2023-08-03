// ==UserScript==
// @name         提取tag
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://exhentai.org/g/*
// @require https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=exhentai.org
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
     $("#h1Title_copy").before("<input type='button' class='btn' value='提取'><input type='text' class='jj'>");
     var metaobj={title:'',title_jpn:'',tags:{},status:'tagged',category:'',url:'',rating:'',mtime:''};
    var tags={};

     $(".btn").click(function(){
         metaobj.url=window.location.href;
         metaobj.title_jpn=$("#h1Origin_copy").text();
         metaobj.title=$("#h1Title_copy").text();
         metaobj.rating=$("#rating_label").text().split(":")[1];
         metaobj.category=$("#gdc").text();
         metaobj.mtime=$("#gdd tr:eq(0) .gdt2").text();


         $("#taglist tr").each(function(){

             var tagType=$(this).find("td:eq(0)").text().replace(":","");
             var tagArr=[];
             $(this).find("div").each(function(){
               tagArr.push( $(this).text());

             });
            tags[tagType]=tagArr;
         });
         metaobj.tags=tags;
//          
         var metajson=JSON.stringify(metaobj);


         $(".jj").val(metajson);
         $(".jj").select();

         document.execCommand('copy');
         metajson="";
         console.log();

     });
    // Your code here...
})();