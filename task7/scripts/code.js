class Game {
    gameGuns = [];
    gameEnemies = [];
    gunType = 0;
    started = false;

    gunAvailability = {
        0: true,
        1: true,
        2: true
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.gameGuns.push(new Cannon(0, canvas.clientHeight, canvas.clientWidth, canvas.clientHeight));

        this.gameEnemies.push(this.createEnemy());
        this.gameEnemies.push(this.createEnemy());
        this.gameEnemies.push(this.createEnemy());

        this.lives = 5;
        this.xp = 0;
        this.lvl = 1;
    }

    createEnemy() {
        let enemy = EnemyFactory.create(this);

        for (let i = 0; i < this.gameEnemies.length; i++) {
            if (Collider.collideLineFigures(enemy, this.gameEnemies[i])) {
                return this.createEnemy();
            }
        }

        return enemy;
    }

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

        ctx.restore();
    }

    rndNumber(from, to) {
        return from + Math.floor(Math.random() * (to - from));
    }

    drawBackground() {
        let ctx = this.ctx;

        ctx.save();
        ctx.fillStyle = "ghostwhite";
        ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        ctx.restore();
    }

    shoot() {
        if (!this.started) return;

        if (this.gunAvailability[this.gunType]) {
            let bullet = GunFabric.create(this.gunType, this.gameGuns[0]);

            this.gunAvailability[this.gunType] = false;
            this.showAvailability(this.gunType, bullet.getTimeout());

            this.gameGuns.push(bullet);
            new ReloadTimer(bullet.getTimeout(), this, this.gunType);
        }
    }

    showAvailability(gunType, time) {
        let gunChangeText = {
            0: "Q Пушка",
            1: "W Черная дыра",
            2: "E Пулемет"
        };

        let timeText = (time / 1000).toFixed(2);
        let text = gunChangeText[gunType] + ((time > 0) ? " (" + timeText + ")" : "");
        document.getElementById("gunType" + gunType).innerText = text;
    }

    changeGun(gunType) {
        this.gunType = gunType;
    }

    drawArray(arr) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].draw(this.ctx);
        }
    }

    moveArray(arr) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].move();

            if (arr[i].checkCollapse()) {
                if (arr[i] instanceof Enemy) {
                    this.lives--;
                }

                arr.splice(i--, 1);
            }
        }
    }

    draw() {
        if (!this.started) return;

        this.drawBackground();
        this.drawArray(this.gameEnemies);
        this.drawArray(this.gameGuns);
        this.gameGuns[0].draw(this.ctx);

        this.drawInterface();
    }

    move() {
        this.moveArray(this.gameEnemies);
        this.moveArray(this.gameGuns);

        for (let i = 1; i < this.gameGuns.length; i++) {
            for (let j = 0; j < this.gameEnemies.length; j++) {
                let bullet = this.gameGuns[i];
                let enemy = this.gameEnemies[j];

                if (Collider.collideBulletEnemy(bullet, enemy)) {
                    if (enemy.hit(bullet)) {
                        this.xp += enemy.getXP();
                        this.gameEnemies.splice(j--, 1);
                    }

                    if (!(bullet instanceof CannonBlackHole)) {
                        this.gameGuns.splice(i, 1);
                        i = (i !== 1) ? i - 1 : i;
                    }
                }

            }
        }

        this.draw();
    }

    drawPause() {
        let ctx = this.ctx;

        ctx.save();

        ctx.fillStyle = "ghostwhite";
        ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        ctx.fillStyle = "dimgray";
        ctx.font = "50px Comic Sans MS";
        ctx.fillText("PAUSE", this.canvas.clientWidth / 2 - 90, this.canvas.clientHeight / 2);

        ctx.restore();
    }

    pauseToggle() {
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

        this.start();
    }

    start() {
        setTimeout(function (timer, game, gunType) {
            if (game.started) {
                timer.currentTime -= 50;
            }

            game.showAvailability(gunType, timer.currentTime);

            if (timer.currentTime > 0) {
                timer.start();
            } else {
                game.gunAvailability[gunType] = true;
            }
        }, 50, this, this.game, this.gunType);
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

function init() {
    let canvas = document.getElementById("gameField");
    let game = new Game(canvas);

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
            game.changeGun(+changeGunButtons[i].id.replace("gunType", ""));

            let buttons = document.getElementsByClassName("changeGun");
            for (let j = 0; j < buttons.length; j++) {
                buttons[j].removeAttribute("style");
            }

            changeGunButtons[i].style.cssText += "background-color: lightsteelblue;";
        })
    }

    document.getElementById("pause").addEventListener('click', () => {
        game.pauseToggle();
    })

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
        }
    });

    document.getElementById("pause").click();
}