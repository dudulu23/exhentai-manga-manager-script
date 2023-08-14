
<?php 
header("Access-Control-Allow-Origin: *");
// 检查请求是否使用了 POST 方法
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 获取 POST 请求的原始数据
    $jsonString = file_get_contents('php://input');

    // 将 JSON 字符串转换为 PHP 数组
    $data = json_decode($jsonString, true);
    $back = [];
    // 检查是否成功解析 JSON
    if (json_last_error() === JSON_ERROR_NONE) {
try {
    // 创建 PDO 实例，连接到 SQLite 数据库文件
    $pdo = new PDO('sqlite:C:\Users\w\AppData\Roaming\exhentai-manga-manager\database.sqlite');

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
} else {
    // 非 POST 请求
    echo "Invalid request method.";
}
?> 
