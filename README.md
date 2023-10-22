## 功能
exhentai-manga-manager的附加浏览器脚本

https://github.com/SchneeHertz/exhentai-manga-manager

1.2 加入了可在e站显示是否已下载该漫画的功能


1.3 在网页端按提取元数据后尝试直接写入数据库，如果失败后和之前版本一样用剪切板录入数据，添加端口号设置和数据库路径设置

1.4 适配新版数据库分离

通过php访问本地C:\Users\用户名\AppData\Roaming\exhentai-manga-manager\database.sqlite 来显示该漫画是否下载

## 使用方法

1.安装apache php 当前使用的php版本为7.3.4，确认php.ini内extension=pdo_sqlite 前面没有分号以启用pdo_sqlite功能

2.将date.php放入apache根目录

3.启动apache服务，确认端口号

4.浏览器上安装tampermonkey并安装js脚本

5.设置端口号和数据库路径

5.e站改为略缩图模式，略缩图下方会显示是否在exhentai-manga-manager里有记录

6.点击“已下载”或“未下载”可直接在数据库里写入对应的元数据，如果失败的话就利用剪切板将信息输入exhentai-manga-manager，录入成功后e站就对应的漫画会变成已下载


## 其他修改

1.右键搜索栏会清除搜索栏内的文字

2.搜索栏内文字改变并失焦后会自动处理文字，去除（）内的内容，去除ehviewer下载的文件夹前面自带的编号，去除压缩文件的.zip后缀，去除~，会自动点击搜索按钮

3.当页面搜索出的漫画数量只有一个时会自动复制当前漫画的元数据



