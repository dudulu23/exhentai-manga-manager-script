
<?php 
header("Content-Type: text/html; charset=utf-8");
header('Access-Control-Allow-Origin:*');

$fun = $_POST['fun'];
$appAppDatapath=$_POST['appAppDatapath'];
$metadatapath=$_POST['metadatapath'];
if($fun=='showDownload'){
    $ehid = $_POST['ehid'];
    showDownload($ehid,$appAppDatapath);
}
if($fun=='updateDatabase'){
    $gid= $_POST['gid'];
    $metaobj = $_POST['metaobj'];
    updateDatabase($metaobj,$gid,$appAppDatapath,$metadatapath);
}
   

function showDownload($jsonString,$appAppDatapath){
        // 将 JSON 字符串转换为 PHP 数组
        $data = json_decode($jsonString, true);
        $back = [];
        // 检查是否成功解析 JSON
        if (json_last_error() === JSON_ERROR_NONE) {
            try {
                // 创建 PDO 实例，连接到 SQLite 数据库文件
                          
                $appAppDatapath='sqlite:'.$appAppDatapath;
 

                $pdo = new PDO($appAppDatapath);

                // $pdo = new PDO($appAppDatapath);

                // 设置 PDO 错误模式为异常
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                // 执行查询语句
                foreach($data as $i){
                    $stmt = $pdo->query("SELECT * FROM `Mangas` WHERE url LIKE '%".$i."%'");
                    // 获取结果集中的数据
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        array_push($back,$i);
                    }
                }
                $back_str=json_encode($back);
                echo $back_str;
                
            } catch (PDOException $e) {
                echo "数据库连接失败：" . $e->getMessage();
            }
        } else {
            // JSON 解析错误
            echo "Failed to decode JSON.";
        }
}
//更新meta
function updateDatabase($metaobj,$gid,$appAppDatapath,$metadatapath){
    echo $metadatapath;
    try {
        $metaobj = json_decode($metaobj, true);
        $metaobj['tags']=json_encode($metaobj['tags']);
        // 创建 PDO 实例，连接到 SQLite 数据库文件
        $pdo = new PDO('sqlite:'.$appAppDatapath);

        $pdo_meta = new PDO('sqlite:'.$metadatapath);
        // 设置 PDO 错误模式为异常
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo_meta->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $sql_update="UPDATE Mangas SET title = '".$metaobj['title']."', rating = '".$metaobj['rating']."', url = '".$metaobj['url']."', title_jpn = '".$metaobj['title_jpn']."', posted = '".$metaobj['posted']."', filecount = '".$metaobj['filecount']."', category = '".$metaobj['category']."', filesize = '".$metaobj['filesize']."', status = '".$metaobj['status']."', tags = '".$metaobj['tags']."' WHERE hash =";
        $sql_update_meta="UPDATE Metadata SET title = '".$metaobj['title']."', rating = '".$metaobj['rating']."', url = '".$metaobj['url']."', title_jpn = '".$metaobj['title_jpn']."', posted = '".$metaobj['posted']."', filecount = '".$metaobj['filecount']."', category = '".$metaobj['category']."', filesize = '".$metaobj['filesize']."', status = '".$metaobj['status']."', tags = '".$metaobj['tags']."' WHERE hash =";

        // 搜索gid
        //三次对比，成功就就跳出判断保留row
        $stmt = $pdo->query("SELECT * FROM `Mangas` WHERE filepath LIKE '%\\".$gid."-%'");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row['hash']==null){

            $stmt = $pdo->query("SELECT * FROM `Mangas` WHERE filepath LIKE '%".$metaobj['title']."%'");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if($row['hash']==null){
                //title_jpn不能为空
                if($metaobj['title_jpn']!=""){
                    $stmt = $pdo->query("SELECT * FROM `Mangas` WHERE filepath LIKE '%".$metaobj['title_jpn']."%'");
                    $row= $stmt->fetch(PDO::FETCH_ASSOC); 
                    
                }
                echo $row['hash'];      
            }
        }
        if($row['hash']==null){
            
            echo "notfind";
        }else{
            try {
                //寻找之前结果的id
             
                $pdo->exec($sql_update."'".$row['hash']."'");
                $pdo_meta->exec($sql_update_meta."'".$row['hash']."'");

                echo "success";
            } catch (PDOException $e) {
                echo "error 1";

            }
            
        }        
           
      
        
    } catch (PDOException $e) {echo "error 2"; echo $e;}
            
}


?> 
