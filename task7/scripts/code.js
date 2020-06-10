class Game {
    gameGuns = [];
    gameEnemies = [];
    gunType = 0;

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.gameGuns.push(new Cannon(0, canvas.clientHeight, canvas.clientWidth, canvas.clientHeight));

        this.gameEnemies.push(this.createEnemy());
        this.gameEnemies.push(this.createEnemy());
        this.gameEnemies.push(this.createEnemy());
    }

    createEnemy() {
        let size = 50;
        let enemy = new Pentagon(this.getCanvasWidth(), this.rndNumber(size, this.getCanvasHeight()), size, 3, 99);

        for (let i = 0; i < this.gameEnemies.length; i++) {
            if (Collider.collideLineFigures(enemy, this.gameEnemies[i])) {
                return this.createEnemy();
            }
        }

        return enemy;
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
        this.gameGuns.push(GunFabric.create(this.gunType, this.gameGuns[0]));
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
                arr.splice(i--, 1);
            }
        }
    }

    draw() {
        this.drawBackground();
        this.drawArray(this.gameEnemies);
        this.drawArray(this.gameGuns);
        this.gameGuns[0].draw(this.ctx);
    }

    move() {
        this.moveArray(this.gameEnemies);
        this.moveArray(this.gameGuns);

        // todo: for check collisions

        this.draw();
    }

    getCanvasWidth() {
        return this.canvas.clientWidth;
    }

    getCanvasHeight() {
        return this.canvas.clientHeight;
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

    window.addEventListener('keydown', event => {
       // todo
    });

    let timer = setInterval(function(){
        game.move();
    }, 10);
}