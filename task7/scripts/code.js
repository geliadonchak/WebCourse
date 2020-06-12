class Game {
    guns = [];
    enemies = [];
    reloadTimers = {
        0: null, 1: null, 2: null
    };

    gunType = 0;
    started = false;
    machineGunAmmo = 15;

    gunAvailability = {
        0: true,
        1: true,
        2: true
    }

    constructor(canvas, player) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.player = player;
        this.lives = 1;
        this.xp = 0;
        this.lvl = 1;

        this.initGame();
    }

    initGame() {
        this.guns.push(new Cannon(0, this.canvas.clientHeight, this.canvas.clientWidth, this.canvas.clientHeight));

        this.enemies.push(this.createEnemy());
        this.enemies.push(this.createEnemy());
        this.enemies.push(this.createEnemy());

        this.changeGameState();
    }

    stopTimers() {
        this.started = false;
        clearInterval(this.timer);

        for (let i = 0; i < 3; i++) {
            if (this.reloadTimers[i]) {
                this.reloadTimers[i].stop();
            }

            this.drawAvailability(i, 0);
        }
    }

    createEnemy() {
        let enemy = EnemyFactory.create(this);

        for (let i = 0; i < this.enemies.length; i++) {
            if (Collider.collideLineFigures(enemy, this.enemies[i])) {
                return this.createEnemy();
            }
        }

        return enemy;
    }

    rndNumber(from, to) {
        return from + Math.floor(Math.random() * (to - from));
    }

    shoot() {
        if (!this.started || this.lives <= 0) return;

        if (this.gunAvailability[this.gunType]) {
            let bullet = GunFabric.create(this.gunType, this.guns[0]);

            this.machineGunAmmo -= this.gunType === 2;

            this.guns.push(bullet);

            if (this.gunType !== 2 || this.machineGunAmmo === 0) {
                this.gunAvailability[this.gunType] = false;
                this.drawAvailability(this.gunType, bullet.getTimeout());
                this.reloadTimers[this.gunType] = (new ReloadTimer(bullet.getTimeout(), this, this.gunType));
            }
        }
    }

    moveArray(arr) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].move();

            if (arr[i].checkCollapse()) {
                if (arr[i] instanceof Enemy) {
                    this.lives--;
                    if (!this.lives) {
                        this.finishGame();
                        return;
                    }

                }

                arr.splice(i--, 1);
            }
        }
    }

    finishGame() {
        this.player.write(this.xp);

        this.drawFinishScreen();
        disableActions(this.canvas);
        this.stopTimers();

        disableButtons();

        setTimeout(function () {
            document.getElementById("showResults").click();
        }, 3000);
    }


    /**
     * DRAW FUNCTIONS
     */
    drawInterface() {
        let ctx = this.ctx;
        ctx.save();

        let image = new Image();
        image.src = "heart.svg";

        for (let i = 0; i < this.lives; i++) {
            ctx.drawImage(image, i * 30 + 5, 5, 30, 25);
        }

        ctx.fillStyle = "dimgray";
        ctx.font = "20px Comic Sans MS";
        ctx.fillText("XP: " + this.xp, 8, 50);
        ctx.fillStyle = "white";
        ctx.fillText(this.lvl + " lvl", 5, this.getCanvasHeight() - 5);
        ctx.textAlign = "right";
        ctx.fillStyle = "dimgray";
        ctx.font = "20px Comic Sans MS";
        ctx.fillText(this.player.nickname, this.canvas.clientWidth - 5, 25);

        ctx.restore();
    }

    drawAvailability(gunType, time) {
        let gunChangeText = {
            0: "Q Пушка",
            1: "W Черная дыра",
            2: "E Пулемет"
        };

        let timeText = (time / 1000).toFixed(2);
        let text = gunChangeText[gunType] + ((time > 0) ? " (" + timeText + ")" : "");
        document.getElementById("gunType" + gunType).innerText = text;
    }

    drawBackground() {
        let ctx = this.ctx;

        ctx.save();
        ctx.fillStyle = "ghostwhite";
        ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        ctx.restore();
    }

    drawFinishScreen() {
        let ctx = this.ctx;

        this.drawBackground();

        ctx.save();

        ctx.fillStyle = "dimgray";
        ctx.font = "50px Comic Sans MS";
        ctx.fillText("Битва проиграна :(", this.canvas.clientWidth / 2 - 230, this.canvas.clientHeight / 2);
        ctx.font = "25px Comic Sans MS";
        ctx.fillText(this.player.nickname + ": " + this.xp + " XP", this.canvas.clientWidth / 2 - 230, this.canvas.clientHeight / 2 + 50);

        ctx.restore();
    }

    drawArray(arr) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].draw(this.ctx);
        }
    }

    drawPause() {
        let ctx = this.ctx;

        ctx.save();

        this.drawBackground();

        ctx.fillStyle = "dimgray";
        ctx.font = "50px Comic Sans MS";
        ctx.fillText("PAUSE", this.canvas.clientWidth / 2 - 90, this.canvas.clientHeight / 2);

        ctx.restore();
    }

    draw() {
        if (!this.started || this.lives <= 0) return;

        this.drawBackground();
        this.drawArray(this.enemies);
        this.drawArray(this.guns);
        this.guns[0].draw(this.ctx);

        this.drawInterface();
    }


    move() {
        this.moveArray(this.enemies);
        this.moveArray(this.guns);

        for (let i = 1; i < this.guns.length; i++) {
            for (let j = 0; j < this.enemies.length; j++) {
                let bullet = this.guns[i];
                let enemy = this.enemies[j];

                if (Collider.collideBulletEnemy(bullet, enemy)) {
                    if (enemy.hit(bullet)) {
                        this.xp += enemy.getXP();
                        this.enemies.splice(j--, 1);
                    }

                    if (!(bullet instanceof CannonBlackHole)) {
                        this.guns.splice(i, 1);
                        i = (i !== 1) ? i - 1 : i;
                        break;
                    }
                }

            }
        }

        this.draw();
    }

    changeGameState() {
        if (this.lives <= 0) return;

        if (!this.started) {
            this.started = true;
            this.draw();

            this.timer = setInterval(function (game) {
                game.move();
            }, 10, this);
        } else {
            this.started = false;
            clearInterval(this.timer);
            this.drawPause();
        }
    }

    getCanvasWidth() {
        return this.canvas.clientWidth;
    }

    getCanvasHeight() {
        return this.canvas.clientHeight;
    }
}

class ReloadTimer {
    constructor(ms, game, gunType) {
        this.currentTime = ms;
        this.game = game;
        this.gunType = gunType;

        this.currentTimeout = null;

        this.start();
    }

    reloadGun() {
        this.game.gunAvailability[this.gunType] = true;
        if (this.gunType === 2) {
            this.game.machineGunAmmo = 15;
        }
    }

    start() {
        this.currentTimeout = setTimeout(function (timer, game, gunType) {
            if (game.started) {
                timer.currentTime -= 50;
            }

            game.drawAvailability(gunType, timer.currentTime);

            if (timer.currentTime > 0) {
                timer.start();
            } else {
                timer.reloadGun();
                timer.stop();
            }
        }, 50, this, this.game, this.gunType);
    }

    stop() {
        clearInterval(this.currentTimeout);
    }
}

class MouseUtils {
    static mouseX = 0;
    static mouseY = 0;

    static getMousePos() {
        return {
            'x': MouseUtils.mouseX,
            'y': MouseUtils.mouseY
        }
    }

    static updateMousePos(canvas, event) {
        let rect = canvas.getBoundingClientRect();
        MouseUtils.mouseX = event.clientX - rect.left;
        MouseUtils.mouseY = event.clientY - rect.top;
    }
}

class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
    }

    move() {
    }
}

class Player {
    constructor(nickname) {
        this.nickname = nickname;
    }

    write(score) {
        let savedScore = getCookie(this.nickname);
        if (!savedScore || savedScore < score) {
            document.cookie = this.nickname + "=" + score;
        }
    }
}

function disableActions(canvas) {
    canvas.addEventListener('mousemove', () => {
    });
    canvas.addEventListener('click', () => {
    });
    document.getElementById("pause").addEventListener('click', () => {
    });
    document.getElementById("changePlayer").addEventListener('click', () => {
    });
    document.getElementById("restart").addEventListener('click', () => {
    });
    document.getElementById("showResults").addEventListener('click', () => {
    });
    window.addEventListener('keydown', () => {
    });
}

function restoreButtons() {
    let buttons = document.getElementsByClassName("changeGun");
    buttons[0].style.cssText += "background-color: lightsteelblue;";
    for (let j = 1; j < buttons.length; j++) {
        buttons[j].removeAttribute("style");
    }
}

function init() {
    document.getElementsByClassName("helloScreen")[0].style.cssText = "display: none";
    document.getElementsByClassName("content")[0].style.cssText = "";

    let nickname = document.getElementById("nickname").value;
    let player = new Player(nickname);
    let canvas = document.getElementById("gameField");
    let game = new Game(canvas, player);

    game.draw();

    canvas.addEventListener('mousemove', event => {
        MouseUtils.updateMousePos(canvas, event);
        game.draw();
    });

    canvas.addEventListener('click', event => {
        MouseUtils.updateMousePos(canvas, event);
        game.shoot();
        game.draw();
    });

    let changeGunButtons = document.getElementsByClassName("changeGun");
    for (let i = 0; i < changeGunButtons.length; i++) {
        changeGunButtons[i].addEventListener('click', () => {
            game.gunType = +changeGunButtons[i].id.replace("gunType", "");

            let buttons = document.getElementsByClassName("changeGun");
            for (let j = 0; j < buttons.length; j++) {
                buttons[j].removeAttribute("style");
            }

            changeGunButtons[i].style.cssText += "background-color: lightsteelblue;";
        })
    }

    document.getElementById("pause").addEventListener('click', () => {
        if (game.lives > 0) {
            game.changeGameState();
        }
    });

    document.getElementById("changePlayer").addEventListener('click', () => {
        restoreButtons();
        game.stopTimers();
        disableActions(canvas);
        document.getElementsByClassName("helloScreen")[0].style.cssText = "";
        document.getElementsByClassName("content")[0].style.cssText = "display: none";
    });

    document.getElementById("restart").addEventListener('click', () => {
        restoreButtons();
        game.stopTimers();
        game = new Game(canvas, player);
    })

    document.getElementById("showResults").addEventListener('click', () => {
        if (game.lives > 0 && game.started) {
            game.changeGameState();
        }
        showResults();
    });

    document.getElementById("resultsBack").addEventListener('click', () => {
        document.getElementsByClassName("content")[0].style.cssText = "";
        document.getElementsByClassName("resultsScreen")[0].style.cssText = "display: none";

        if (game.lives > 0) {
            game.changeGameState();
        }

        enableButtons();
    });

    window.addEventListener('keydown', event => {
        switch (event.key) {
            case 'q':
            case 'Q':
                document.getElementById("gunType0").click();
                break;
            case 'w':
            case 'W':
                document.getElementById("gunType1").click();
                break;
            case 'e':
            case 'E':
                document.getElementById("gunType2").click();
                break;
            case 's':
            case 'S':
                document.getElementById("pause").click();
                break;
            // case 'r':
            // case 'R':
            //     document.getElementById("restart").click();
            //     break;
        }
    });
}

function getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function showResults() {
    document.getElementsByClassName("content")[0].style.cssText = "display: none";
    document.getElementsByClassName("resultsScreen")[0].style.cssText = "";

    let cookies = document.cookie.split('; ');

    let results = [];
    for (let i = 0; i < cookies.length; i++) {
        let temp = cookies[i].split('=');
        results.push({'name': temp[0], 'score': +temp[1]});
    }

    results.sort(function (a, b) {
        if (a.score === b.score) return 0;
        return a.score < b.score ? 1 : -1;
    });

    if (document.cookie.trim() === "") {
        results = [];
    }

    let table = document.getElementById("resultsBody");
    table.innerHTML = "";
    for (let i = 0; i < results.length; i++) {
        if (i === 10) return;
        table.innerHTML += `<tr><td>${i + 1}</td><td>${results[i].name}</td><td>${results[i].score}</td></tr>`;
    }
}

function disableButtons() {
    document.getElementById("gunType0").style.cssText = "display: none;";
    document.getElementById("gunType1").style.cssText = "display: none;";
    document.getElementById("gunType2").style.cssText = "display: none;";
    document.getElementById("pause").style.cssText = "display: none;";
    document.getElementById("restart").style.cssText = "display: none;";
    document.getElementById("changePlayer").style.cssText = "display: none;";
    document.getElementById("showResults").style.cssText = "display: none;";
}

function enableButtons() {
    document.getElementById("gunType0").style.cssText = "";
    document.getElementById("gunType1").style.cssText = "";
    document.getElementById("gunType2").style.cssText = "";
    document.getElementById("pause").style.cssText = "";
    document.getElementById("restart").style.cssText = "";
    document.getElementById("changePlayer").style.cssText = "";
    document.getElementById("showResults").style.cssText = "";
}