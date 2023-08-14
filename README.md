exhentai-manga-manager的附加浏览器脚本
https://github.com/SchneeHertz/exhentai-manga-manager
加入了可在e站显示是否已下载该漫画的功能
通过php访问本地C:\Users\w\AppData\Roaming\exhentai-manga-manager\database.sqlite 来显示该漫画是否下载
安装apache php 当前使用的php版本为7.3.4
确认php.ini内extension=pdo_sqlite 前面没有分号以启用pdo_sqlite功能
将date.php放入apache根目录
启动apache服务，确认端口端口号，js脚本内默认为8080端口，可自行修改
浏览器上安装tampermonkey并安装js脚本
e站改为略缩图模式，略缩图下方会显示是否在exhentai-manga-manager里有记录
点击“已下载”或“未下载”可提取对应的元数据
利用剪切板将信息输入exhentai-manga-manager，录入成功后e站就对应的漫画会变成已下载
其他修改
1.右键搜索栏会清除搜索栏内的文字
2.搜索栏内文字改变并失焦后会自动处理文字，去除（）内的内容，去除ehviewer下载的文件夹前面自带的编号，去除压缩文件的.zip后缀，去除~，会自动点击搜索按钮
3.当页面搜索出的漫画数量只有一个时会自动复制当前漫画的元数据



