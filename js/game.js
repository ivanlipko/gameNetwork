// colors
var c_connected = '#b0b30045'; // 0F02
var c_disconnected = '#d30a'; // F001   bb3300a0

// var c_gconnected = '#AF06';  // radius of gateway
var c_gconnected = '#FFF5';  // radius of gateway
// var c_gdisconnected = '#FA0A';  // radius of gateway
var c_gdisconnected = '#F00F';  // radius of gateway
var c_pool = '#000000';

var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");
var results = document.getElementById("results");

// images
var gfxgateway = new Image();
gfxgateway.src = "gfx/gateway.png";
var gfxuser = new Image();
gfxuser.src = "gfx/user.png";
var gfxrouter = new Image();
gfxrouter.src = "gfx/router.png";
var gfxbg = new Image();
gfxbg.src = "gfx/bg.png";
var gfxtime = new Image();
gfxtime.src = "gfx/times.png";
var gfxareas = new Image();
gfxareas.src = "gfx/areas.png";
var gfxmoney = new Image();
gfxmoney.src = "gfx/money.png";
var gfxwww = new Image();
gfxwww.src = "gfx/www.png";
var gfxpanel = new Image();
gfxpanel.src = "gfx/panel.png";

// sound
var sfxdnomoney = new Audio('sfx/no_money.mp3');
var sfxdaddpoint = new Audio('sfx/addpoint.mp3');
var sfxdtimer = new Audio('sfx/timer.mp3');
var sfxclock = new Audio('sfx/timerend.mp3');

var sfxAdduser = new Array();
sfxAdduser[0] = new Audio('sfx/adduser1.mp3');
sfxAdduser[1] = new Audio('sfx/adduser2.mp3');
sfxAdduser[2] = new Audio('sfx/adduser3.mp3');


// ingame vars
var isGameStart = false;
var isGameStop = false;
var isFinishTimer = false;

var spawnwave = 0;
var conCount = 0;
var conCountprev = 0;
var money = 100;
var routerPrice = 25;
var gatePrice = 50;
var userDonateMin = 0.5;
var userDonateMax = 1.5;
var score = 0;
var scoreArea = 0;



function drawStart(params) {
    ctx.font = "20px Verdana";
    ctx.fillStyle = "#2F4859";
    ctx.fillText("Ставь Роутеры      (ЛКП) ближе к Шлюзам", cvs.width / 7, cvs.height / 4 + 90);
    ctx.drawImage(gfxrouter,  cvs.width / 7 + 130, cvs.height / 4 + 50 , 90, 70);
    ctx.fillText("Расставляй Шлюзы       (ПКМ) рядом с другими", cvs.width / 7, cvs.height / 4 + 120);
    ctx.drawImage(gfxgateway, cvs.width / 7 + 210, cvs.height / 4 + 100, 30,30);
    ctx.fillText("Подключи все клиентов     к Интернету", cvs.width / 7, cvs.height / 4 + 150);
    ctx.fillText("Нажмите для старта", cvs.width / 7, cvs.height / 4 + 200);
    ctx.drawImage(gfxuser, cvs.width / 7 + 260, cvs.height / 4 + 150 - 21, 13 * 1.1, 21 * 1.1);
    ctx.drawImage(gfxwww, cvs.width / 7 + 420, cvs.height / 4 + 130, 54 * 0.7, 46 * 0.7);
}

function drawFinish() {
    ctx.font = "20px Verdana";
    ctx.fillStyle = "#2F4859";
    ctx.fillText("Игра окончена", cvs.width / 7, cvs.height / 4 + 90);
    ctx.fillText("Вы подключили " + scoreArea + "% пользователей", cvs.width / 7, cvs.height / 4 + 120);
    ctx.fillText("Вы заработали " + Math.floor(money) + "p", cvs.width / 7, cvs.height / 4 + 150);
    ctx.fillText("Ваш счёт " + score, cvs.width / 7, cvs.height / 4 + 200);
    ctx.fillText("Отправляйте свои результаты в ТОП!", cvs.width / 7, cvs.height / 4 + 250);
    ctx.drawImage(gfxuser, 410, 70, 13 * 1.1, 21 * 1.1);
    ctx.drawImage(gfxuser, 610, 570, 13, 21);
    ctx.drawImage(gfxwww, 200, 100, 54, 46);
    ctx.drawImage(gfxrouter, 400, 150, 90,70);
    ctx.drawImage(gfxrouter, 500, 350, 90,70);
    ctx.drawImage(gfxrouter, 250, 550, 90,70);
    ctx.drawImage(gfxgateway, 300, 650, 30,30);
    ctx.drawImage(gfxmoney, 0, 8 * 70 + (8 - 1) * (17), 80, 80, 605, 150, 80, 80);
}

function drawEllipse(ctx, coords, sizes, angle) {
    ctx.beginPath();
    ctx.save(); // сохраняем стейт контекста
    ctx.translate(coords[0], coords[1]); // перемещаем координаты в центр эллипса
    ctx.rotate(angle); // поворачиваем координатную сетку на нужный угол
    ctx.scale(1, sizes[1] / sizes[0]); // сжимаем по вертикали
    ctx.arc(0, 0, sizes[0], 0, Math.PI * 2); // рисуем круг
    ctx.restore(); // восстанавливает стейт, иначе обводка и заливка будут сплющенными и повёрнутыми
    // ctx.strokeStyle = 'green';
    // ctx.stroke(); // обводим
    ctx.closePath();
}

function drawline(sx, sy, ex, ey) {
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
}

// ui
function drawTime(t = 100) {
    frm = 10 - Math.floor((100 - t) / 10);
    ctx.drawImage(gfxtime, 0, frm * 70 + (frm) * 17, 70, 70, 4, 170, 70, 70);
    ctx.font = "14px Verdana";
    ctx.fillStyle = "#FFF";
    ctx.fillText(100 - t, 27, 210);  // +27, +45
}

function drawAreas(ar = 100) {
    frm = 10 - Math.floor((105 - ar) / 10);
    ctx.drawImage(gfxareas, 0, frm * 78, 78, 78, 0, 85, 78, 78);
    ctx.font = "14px Verdana";
    ctx.fillStyle = "#FFF";
    ctx.fillText(ar + "%", 27, 130);  // +27, +45
    // results.innerHTML = ar + "<br>"+ frm ;
}

function drawMoney(m = 100) {
    frm = Math.floor(10 * (m / 35185));  // money / max_spended_money_in_game 
    if (frm > 10)
        frm = 10;
    if (frm < 0)
        frm = 0;
    //results.innerHTML = m + "<br>"+ frm + "<br>" + (m / 35185);
    ctx.drawImage(gfxmoney, 0, frm * 70 + (frm - 1) * (17), 80, 80, 5, 0, 80, 80);
    ctx.font = "14px Verdana";
    ctx.fillStyle = "#FFF";
    ctx.fillText(Math.floor(m) + "p", 70, 55);  // +27, +45    
}


// ---------------------------------------------------
// 
var Web = function (x, y) {
    this.x = x;
    this.y = y;
    this.gateways = [];
};

Web.prototype = {
    draw: function () {
        // link from router
        // for (i = 0; i < this.gateways.length; i++) {
        //     drawline(this.x, this.y, this.gateways[i][0], this.gateways[i][1]);
        // }
        ctx.drawImage(gfxwww, this.x, this.y, 54, 46);
    }
};

var web = [];



var User = function (x, y, volume_start, pay) {
    this.x = x;
    this.y = y;
    //    this.volume_start = volume_start;
    //    this.volume = 1;
    //    this.pay = pay;
    this.w = 13;
    this.h = 21;
    this.con = false;
};

User.prototype = {
    draw: function () {
        // body
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
        if (this.con) {
            // ctx.fillStyle = c_connected;
            // ctx.fill();
        } else {
            // ctx.fillStyle = c_disconnected;
            // ctx.fill();
            ctx.drawImage(gfxuser, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
        }
        ctx.closePath();

    }
};

var users = [];



var Router = function (x, y, maxvolume = 3) {
    this.x = x;
    this.y = y;
    //    this.volume = 0;  // volume of traffic
    //    this.maxvolume = maxvolume;  // max volume of traffic
    this.area = 2500;  // radius of connected users
    this.w = 90;
    this.h = 70;
    this.users = [];
    this.connected = false;
};

Router.prototype = {
    draw: function () {
        ctx.beginPath();
        if (this.con) {
            // ctx.fillStyle = c_connected;
            // ctx.fill();
            ctx.drawImage(gfxrouter, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
        } else {
            // ctx.arc(this.x, this.y, this.area / 50, 0, 2 * Math.PI, false);
            // drawEllipse(ctx, [this.x, this.y], [this.area / 50, this.area / 80], 0);
            drawEllipse(ctx, [this.x, this.y], [this.w / 2, this.h / 2.2], 0);
            //ctx.drawImage(router, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
            ctx.strokeStyle = c_disconnected;
            ctx.stroke();
        }

        ctx.closePath();
    }
};

var routers = [];



var Gateway = function (x, y, volume = 7) {
    this.x = x;
    this.y = y;
    //    this.volume = volume;  // volume of traffic
    this.area = 10000;  // radius to connect with another routers or gateways
    this.w = 30;
    this.h = 30;
    this.routers = [];
    this.gateways = [];
    this.con = false;
};

Gateway.prototype = {
    draw: function () {
        // link between gateways
        // for (i = 0; i < this.gateways.length; i++) {
        //     drawline(this.x, this.y, this.gateways[i][0], this.gateways[i][1]);
        // }
        // ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.area / 100, 0, 2 * Math.PI, false);
        ctx.closePath();
        if (this.con) {
            drawEllipse(ctx, [this.x, this.y], [this.area / 100, this.area / 160], 0);
            ctx.strokeStyle = c_gconnected;
            ctx.stroke();
        } else {
            drawEllipse(ctx, [this.x, this.y], [this.area / 100, this.area / 160], 0);
            ctx.strokeStyle = c_gdisconnected;
            ctx.stroke();

            drawEllipse(ctx, [this.x, this.y], [13, 6], 0);
            ctx.fillStyle = c_gdisconnected;
            ctx.fill();
        }
        ctx.drawImage(gfxgateway, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    }
};

var gateways = [];



// ---------------------------------------------------
// 
function playFinish(count) {
    // console.log("timer " + count + " " + new Date().getTime());
    sfxdtimer.play();
    if (count < 10)
        setTimeout(playFinish, 1000, (count + 1));
    else
        sfxclock.play();
}

function getRandomInRange(min, max) {
    /* random in [min, max] */
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function update() {
    /** Update game state */
    if (!isGameStart)
        return;
    if (isGameStop)
        return;
    spawnwave++;
    //spawnInTore(pool.width/2, pool.height/2);
    if (spawnwave < 20)
        spawnInRect(50, cvs.height - 170, 300, 150, 3, 6);
    else if (spawnwave < 30)
        spawnInRect(30, cvs.height - 500, 300, 300, 5, 10);
    else if (spawnwave < 40)
        spawnInTore(300, 200);
    else if (spawnwave < 70)
        spawnInTore(500, 250, 250, 5);
    else if (spawnwave < 90)
        spawnInRect(475, 400, 300, 300, 3, 6);
    else if (spawnwave < 100) {
        if (!isFinishTimer) {
            isFinishTimer = true;
            playFinish(1);
            //setTimeout(playFinish(1), 100);
        };
    } else {
        isGameStop = true;
    }

    routeUsers();

    conCount = 0;
    for (i = 0; i < users.length; i++)
        if (users[i].con)
            conCount++;
    if (conCountprev < conCount) {
        it = getRandomInRange(0, 2);
        sfxAdduser[it].play();
    }
    conCountprev = conCount;
    money += getRandomFloat(userDonateMin, userDonateMax) * conCount;
    score = Math.floor(conCount / (users.length + 0.01) * money);

    scoreArea = Math.floor(100 * conCount / (users.length + 0.01));

    //  Because we must perform above calculations and show form to upload results
    if (isGameStop) {
        /* canvas.toDataUrl() Not allowed on local machines because of crossdomain safety
            https://stackoverflow.com/questions/22710627/tainted-canvases-may-not-be-exported
            http://www.java2s.com/Tutorials/Javascript/Canvas_How_to/Image/Open_canvas_output_image_URL_in_new_window.htm
        */
        var finalImage;
        finalImage = cvs.toDataURL("image/jpeg", 0.1);
        results.innerHTML += ' <form action= "results.php" method= "POST" target="_blank" > \
            <p>Имя: <input type= "text" name= "name" required="" value="Неизвестная панда">  \
            <input type="hidden" name="score" value="' + score + '"> \
            <input type="hidden" name="area" value="' + scoreArea + '"> \
            <input type="hidden" name="image" value="' + finalImage + '"> \
            <input type= "submit" value= "Отправить"> </p>\
            </form>';
    }
}



function spawnInTore(cx, cy, spawnR = 150, spawnMin = 3, spawnMax = 7) {
    // spawn users in TORE-figure
    co = getRandomInRange(spawnMin, spawnMax);
    for (i = 0; i < co; i++) {
        a = getRandomFloat(0, Math.PI * 2);
        r = getRandomFloat(60, spawnR);
        x = Math.floor(cx + r * Math.sin(a));
        y = Math.floor(cy + r * Math.cos(a));
        users.push(new User(x, y, 0.5, 0.1));  // (x,y,volume_start,pay)
    }
}

function spawnInRect(ltx, lty, w, h, spawnMin = 3, spawnMax = 7) {
    /** spawn in (w,h)-size rectangle from left top (x,y) corner     */
    co = getRandomInRange(spawnMin, spawnMax);
    for (i = 0; i < co; i++) {
        x = ltx + getRandomInRange(0, w);
        y = lty + getRandomInRange(0, h);
        users.push(new User(x, y, 0.5, 0.1));  // (x,y,volume_start,pay)
    }
}


// ---------------------------------------------------
// 
function routeUsers() {
    /** Connect users to routers */
    for (j = 0; j < routers.length; j++)
        routers[j].users = [];

    // routers vs users
    for (i = 0; i < users.length; i++) {
        if (users[i].con)
            continue;
        for (j = 0; j < routers.length; j++) {
            d2 = Math.pow((users[i].x - routers[j].x), 2) + Math.pow((users[i].y - routers[j].y), 2);
            // connect
            if (d2 <= routers[j].area) {
                routers[j].users.push([users[i].x, users[i].y]);
                users[i].con = users[i].con || routers[j].con;
            }
        }
    }
}

function routeRouters() {
    /** Connect routers to gatewayes */
    for (j = 0; j < gateways.length; j++)
        gateways[j].routers = [];

    // routers vs gateways
    for (i = 0; i < routers.length; i++) {
        dmin = -Math.log(0);  // Infinity 
        imin = -1;
        for (j = 0; j < gateways.length; j++) {
            d2 = Math.pow((gateways[j].x - routers[i].x), 2) + Math.pow((gateways[j].y - routers[i].y), 2);
            // connect
            if (d2 <= gateways[j].area) {
                gateways[j].routers.push([routers[i].x, routers[i].y]);
                routers[i].con = gateways[j].con || routers[i].con;
            }
        }
    }
}

function routeGateways() {
    /** Connect gateways to www */
    for (j = 0; j < web.length; j++)
        web[j].gateways = [];

    // web vs gateways
    for (i = 0; i < gateways.length; i++) {
        dmin = -Math.log(0);  // Infinity 
        imin = -1;
        for (j = 0; j < web.length; j++) {
            d2 = Math.pow((gateways[i].x - web[j].x), 2) + Math.pow((gateways[i].y - web[j].y), 2);
            // connect
            if (d2 <= gateways[i].area) {
                web[j].gateways.push([gateways[i].x, gateways[i].y]);
                gateways[i].con = true;
            }
        }
    }

    for (j = 0; j < gateways.length; j++)
        gateways[j].gateways = [];

    // gateways vs gateways
    for (k = 0; k < gateways.length; k++)  // чтобы обойти все элементы
        for (i = 0; i < gateways.length; i++) {
            dmin = -Math.log(0);  // Infinity 
            imin = -1;
            for (j = 0; j < gateways.length; j++) {
                if (j == i)
                    continue;
                d2 = Math.pow((gateways[j].x - gateways[i].x), 2) + Math.pow((gateways[j].y - gateways[i].y), 2);
                // connect
                if (d2 <= gateways[j].area) {
                    gateways[j].gateways.push([gateways[i].x, gateways[i].y]);
                    gateways[j].con = gateways[j].con || gateways[i].con;
                }
            }
        }
}


// ---------------------------------------------------
// 
cvs.onclick = function (e) {
    if (!isGameStart) {
        startGame();
        return;
    }
    if (isGameStop)
        return;
    if (money >= routerPrice) {
        routers.push(new Router(e.pageX, e.pageY, 3));
        money -= routerPrice;
        sfxdaddpoint.play();
    } else {
        sfxdnomoney.play();
    }
    routeRouters();
    // results.innerHTML += "r " + e.pageX + ", " + e.pageY;
}

cvs.oncontextmenu = function (e) {
    if (isGameStop)
        return false;
    if (money >= gatePrice) {
        gateways.push(new Gateway(e.pageX, e.pageY, 7));
        money -= gatePrice;
        sfxdaddpoint.play();
    } else {
        sfxdnomoney.play();
    }
    routeGateways();
    routeRouters();
    // results.innerHTML += "g " + e.pageX + ", " + e.pageY;
    return false;
}



// ---------------------------------------------------
// 
function draw() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    if (!isGameStart) {
        drawStart();
    } else {
        if (isGameStop) {
            drawFinish();
        } else {

            for (i = 0; i < web.length; i++) {
                web[i].draw()
            }

            for (i in routers) {
                routers[i].draw()
            }

            for (i in gateways) {
                gateways[i].draw()
            }

            ctx.drawImage(gfxbg, 0, 0, cvs.width, cvs.height);

            for (i = 0; i < users.length; i++) {
                users[i].draw()
            }

            ctx.drawImage(gfxpanel, 0, 0, cvs.width, 100);
            drawTime(spawnwave);
            drawAreas(scoreArea);
            drawMoney(money);
        }

        //// for debug
        // ctx.font = "30px Verdana";
        // ctx.fillStyle = "#00f";
        // ctx.fillText("Очки " + score, 10, 30);
        // ctx.fillText("Деньги " + Math.floor(money) + "р", 10, 60);
        // ctx.fillText("Покрытие " + scoreArea + "%", 10, 90);
        // ctx.fillText("Время " + (110-spawnwave), 10, 120);
    }
    requestAnimationFrame(draw);
}



// Начало игры сразу при клике
function startGame() {
    isGameStart = true;
    // web.push(new Web(getRandomInRange(0,pool.width),getRandomInRange(0,pool.height)));
    web.push(new Web(15, cvs.height - 60));
    gateways.push(new Gateway(90, cvs.height - 60, 7));
    routeGateways();
}

setInterval(update, 1000);
draw();

