
<?php 
header("Content-Type: text/html; charset=utf-8");
header('Access-Control-Allow-Origin:*');

$fun = $_POST['fun'];

if($fun=='sha1'){
    $page = $_POST['page'];
    $metadatapath = $_POST['metadatapath'];
    $metaobj = $_POST['metaobj'];
    $ehid = $_POST['ehid'];
    $downloadPath = $_POST['downloadPath'];
    $folders=glob($downloadPath.'/'.$ehid.'-*',GLOB_ONLYDIR);
    foreach ($folders as $folder) {
       
    }

    

    $imagePath = $folder.'/'.$page; // 图片的路径
    
    if (file_exists($imagePath)) {
      $sha1Hash = sha1_file($imagePath);
      echo $sha1Hash;
      insertMeta($metaobj,$metadatapath,$sha1Hash);
    } else {
      echo "图片文件不存在";
    }
}
if($fun=='showDownload'){
    $appAppDatapath=$_POST['appAppDatapath'];
    $metadatapath=$_POST['metadatapath'];
    $ehid = $_POST['ehid'];
    showDownload($ehid,$appAppDatapath);
}
if($fun=='updateDatabase'){
    $appAppDatapath=$_POST['appAppDatapath'];
    $metadatapath=$_POST['metadatapath'];
    $gid= $_POST['gid'];
    $metaobj = $_POST['metaobj'];
    updateDatabase($metaobj,$gid,$appAppDatapath,$metadatapath);
}
if($fun=='download'){
    $downloadPath = $_POST['downloadPath'];
    $page= $_POST['page'];
    $imageUrl= $_POST['imageUrl'];
    $filename = $_POST['filename'];
    $dirPath = $downloadPath.'/'.$filename;
 
    if (!file_exists($dirPath)) {
        mkdir($dirPath, 0777, true);
    }
    $savePath = $dirPath.'/'.$page.".jpg";
 
    if (!file_exists($savePath)||filesize($savePath)==0) {
        

        //下载图片并保存到指定位置
        $data=file_get_contents($imageUrl);
        
        if ($data === false) {
          echo '下载文件失败';
         } else {
          $result = file_put_contents($savePath,$data); // 将文件保存到指定的路径

          if ($result === false) {
            echo '保存文件失败';
          } else {
            echo '文件已成功下载并保存到 ' . $savePath;
          }
        }
       
    }else{
         echo '(已存在)文件已成功下载并保存到 ' . $savePath;
    }
    



    // $fp = fopen($savePath, 'w+');

    // $ch = curl_init($imageUrl);
    // curl_setopt($ch, CURLOPT_TIMEOUT, 30000); // 设置超时时间为300秒
    // curl_setopt($ch, CURLOPT_FILE, $fp);
    // curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    // curl_exec($ch);

    // if(curl_errno($ch)){
    //     echo 'Curl error: ' . curl_error($ch);
    // }

    // curl_close($ch);
    // fclose($fp);
} 

//已下载图片显示
if($fun=='page_check'){
    $downloadPath = $_POST['downloadPath'];
    $ehid = $_POST['ehid'];
    $folders=glob($downloadPath.'/'.$ehid.'-*',GLOB_ONLYDIR);
    $fileList = array();
    foreach ($folders as $folder) {
        $files = scandir($folder);

        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $path = $folder . '/' . $file;
                 $fileSize = filesize($path);
                 if($fileSize!=0){
               
                   $file=str_replace('Page_', '', $file);
                   $file=str_replace('.jpg', '', $file);
                    $fileList[] = $file;
                }
            }
        }
    }
    $fileList_str=json_encode($fileList);
                echo $fileList_str;
   
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
                    $fi=str_replace("/", "", $i);
                    $fi="\\".$fi."-";
                  
                    $stmt = $pdo->query("SELECT * FROM `Mangas` WHERE url LIKE '%".$i."%' OR filepath LIKE '%".$fi."%'");
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
//插入meta
function insertMeta($metaobj,$metadatapath,$hash){
    try {
        $current_time = date("Y-m-d H:i:s.v");
        $metaobj = json_decode($metaobj, true);
        $metaobj['tags'] = json_encode($metaobj['tags']);

        // 创建 PDO 实例，连接到 SQLite 数据库文件
        $pdo_meta = new PDO('sqlite:'.$metadatapath);
        // 设置 PDO 错误模式为异常
        $pdo_meta->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $sql_INSERT_meta = "INSERT OR REPLACE INTO Metadata (title, rating, url, title_jpn, posted, filecount, category, filesize, status, tags, hash, mark, createdAt, updatedAt) 
                            VALUES (:title, :rating, :url, :title_jpn, :posted, :filecount, :category, :filesize, :status, :tags, :hash, '0', :createdAt, :updatedAt)";

        $stmt = $pdo_meta->prepare($sql_INSERT_meta);
        $stmt->bindParam(':title', $metaobj['title']);
        $stmt->bindParam(':rating', $metaobj['rating']);
        $stmt->bindParam(':url', $metaobj['url']);
        $stmt->bindParam(':title_jpn', $metaobj['title_jpn']);
        $stmt->bindParam(':posted', $metaobj['posted']);
        $stmt->bindParam(':filecount', $metaobj['filecount']);
        $stmt->bindParam(':category', $metaobj['category']);
        $stmt->bindParam(':filesize', $metaobj['filesize']);
        $stmt->bindParam(':status', $metaobj['status']);
        $stmt->bindParam(':tags', $metaobj['tags']);
        $stmt->bindParam(':hash', $hash);
        $stmt->bindParam(':createdAt', $current_time);
        $stmt->bindParam(':updatedAt', $current_time);
        $stmt->execute();

        echo "success";
    } catch (PDOException $e) {
        // 记录错误信息到日志
        error_log("Error occurred: " . $e->getMessage());
        echo $e;
    }      
}

?> 
