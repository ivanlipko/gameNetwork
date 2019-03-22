<?php
error_reporting(-1);
ini_set('display_errors', 'On');

$host = 'localhost'; // адрес сервера 
$db_name = '***'; // имя базы данных
$db_user = '***'; // имя пользователя
$db_pass = '***'; // пароль


$date = date("Y-m-d_H:i:s");
$path_date = date("y.m.d"); // число.месяц.год 
$backurl = "http://95.213.195.19/games/";  // На какую страничку переходит после отправки письма 
$path_base = "results";
$path_img = "/"+$path_base+"/"+$path_date;

echo "<html><title>Network game</title><head><body>";
// Принимаем данные из формы 
if(!$_POST){
    echo "<center>Переданы неверные данные!
        <script language='Javascript'><!-- 
        function reload() {location = \"$backurl\"}; setTimeout('reload()', 96000); 
        //--></script> 
        Сейчас направим тебя <a href='http://95.213.195.19/games/'><B>назад</B></a>...";
    exit;
}
$mysqli = new mysqli($host, $db_user, $db_pass, $db_name);
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

$score = intval($_POST['score']); 
$area = intval($_POST['area']); 

$name = strip_tags($_POST['name']);  // $name = $_POST['name']; 
$name = htmlspecialchars($name);
$name = mysqli_real_escape_string($mysqli, $name);

$image = $_POST['image']; 
// echo "image: $image<br>";
$image = strip_tags($image);  // $image = $_POST['image']; 
$image = htmlspecialchars($image);
$image = mysqli_real_escape_string($mysqli, $image);
// echo "image: $image<br>";

// Проверяем валидность
$maxScore = 42735;
$max_area = 100; 
$over = $score > $maxScore and $area > $max_area;

// echo $_POST;
// echo "$name <br> $score <br>$area<br>";

// echo "<br>";
// echo "$score > $maxScore <br>" ;
// echo "$area > $max_area<br>";
// echo var_dump($over);

if($over){ 
    echo "<center>Переданы неверные данные!
        <script language='Javascript'><!-- 
        function reload() {location = \"$backurl\"}; setTimeout('reload()', 96000); 
        //--></script> 
        Сейчас направим тебя <a href='http://95.213.195.19/games/'><B>назад</B></a>...";

} else {
    if($score < 100 or $area < 5){
        echo "$name, у тебя низкий результат! 
            <script language='Javascript'><!-- 
            function reload() {location = \"$backurl\"}; setTimeout('reload()', 96000); 
            //--></script>
            Сейчас направим тебя <a href='http://95.213.195.19/games/'><B>назад</B></a>..."; 
    } else {

        chdir($path_base);
        if(!file_exists($path_img)){
            echo getcwd();
            mkdir($path_img);
            echo "create $path_img";
        }

        // Get image. An efficient method for extracting, decoding, and checking for errors is:
        // https://stackoverflow.com/questions/11511511/how-to-save-a-png-image-server-side-from-a-base64-data-string
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif
            if (!in_array($type, [ 'jpg', 'jpeg', 'gif', 'png' ])) {
                throw new \Exception('invalid image type');
            }
            $image = base64_decode($image);
            if ($image === false) {
                throw new \Exception('base64_decode failed');
            }
        } else {
            throw new \Exception('did not match data URI with image data');
        }
        // echo " uplodaed " . 
        file_put_contents("$path_img/img_$name-$date.{$type}", $image);


        mysqli_query($mysqli,"SET CHARACTER SET 'utf8';");
        mysqli_query($mysqli,"SET NAMES 'utf8';");
        $query = "INSERT INTO network (date, name, score, area) VALUE ('$date', '$name', '$score', '$area')";
        if (  mysqli_query($mysqli, $query)  ) echo "$name, твой результат принят!";
        else echo "$name, что-то пошло не так с БД ("  .  mysqli_error($mysqli) . ")<br>";

        echo "<!--script language='Javascript'><!-- 
        function reload() {location = \"$backurl\"}; setTimeout('reload()', 96000); 
        //--></script>
        Другие участники ниже. Вернуться <a href='http://95.213.195.19/games/'><B>назад</B></a>.<br><br>";

        echo "....... Дата/время ............... Имя ...................... Очки  ........... Покрытие<br>";
        $query = "SELECT * FROM network ORDER BY score DESC, area DESC";
        if ($result = $mysqli->query($query)) {
            while ($obj = $result->fetch_object()) {
                // var_dump($obj);
                if($obj->name == $name) 
                    echo "<b>";
                echo "$obj->date $obj->name $obj->score $obj->area";
                if($obj->name == $name) 
                    echo "</b>";
                echo "<br><br>";
            }
            $result->close();
        }
    }
} 
$mysqli->close();
exit; 
?>
