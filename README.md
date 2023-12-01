## 功能
exhentai-manga-manager的附加浏览器脚本

https://github.com/SchneeHertz/exhentai-manga-manager

1.下载漫画,在搜索页面（略缩图模式）点击原本下载torrents箭头即可开始下载，在漫画页面点击"未下载"开始下载，并在下载漫画后自动向metadata.sqlite写入元数据，当图片加载失败时会自动重载，下载到一半的漫画可以继续下载。

2.在网页端按提取元数据后尝试直接写入数据库，如果失败后和之前版本一样用剪切板录入数据

3. 可在e站显示是否已下载该漫画（因为下载功能并没有向database.sqlite写入数据，所以通在搜索页面不会直接显示已下载，需要打开exhentai-manga-manager扫描新的漫画后更新database.sqlite才会更改为已下载）

## 使用方法

1.安装apache php 当前使用的php版本为7.3.4，确认php.ini内extension=pdo_sqlite 前面没有分号以启用pdo_sqlite功能

2.将date.php放入apache根目录

3.启动apache服务，确认端口号

4.浏览器上安装tampermonkey并安装js脚本

5.点击上方的“点击设置”设置端口号，数据库路径，meta路径和下载路径

5.e站改为略缩图模式，略缩图下方会显示是否在exhentai-manga-manager里有记录

## 其他修改

1.右键搜索栏会清除搜索栏内的文字

2.搜索栏内文字改变并失焦后会自动处理文字，去除（）内的内容，去除ehviewer下载的文件夹前面自带的编号，去除压缩文件的.zip后缀，去除~，会自动点击搜索按钮

3.当页面搜索出的漫画数量只有一个时会自动复制当前漫画的元数据

## 注意事项
不要打开过多的下载窗口

下载不动时点击下载窗口数字能刷新页面


