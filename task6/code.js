class Figure {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.color = this.rndColor();
        this.direction = null;
    }

    rndColor() {
        return 'rgb(' + Math.floor(Math.random() * 256) + ','
            + Math.floor(Math.random() * 256) + ','
            + Math.floor(Math.random() * 256) + ')';
    }

    rndNumber(from, to) {
        return from + Math.floor(Math.random() * to);
    }

    move() {
        let dir = directionsList[this.direction];
        if (this.direction === 4) {
            dir = directionsList[rndDirection()];
        }

        this.x += speed * dir[0];
        this.y += speed * dir[1];
    }

    setDirection(direction) {
        this.direction = direction;
    }
}

class Ball extends Figure {
    constructor(x, y) {
        super(x, y);

        this.radius = this.rndNumber(10, 25);
    }

    getFillStyle() {
        let gradient = ctx.createRadialGradient(
            this.x + this.radius / 4,
            this.y - this.radius / 6,
            this.radius / 8,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(0.85, this.color);
        return gradient;
    }

    increaseSize() {
        this.radius += 1;
        return this.radius <= 40;
    }

    draw() {
        ctx.fillStyle = this.getFillStyle();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
    }
}

class Rectangle extends Figure {
    constructor(x, y) {
        super(x, y);

        this.w = this.rndNumber(20, 50);
        this.h = this.rndNumber(20, 50);
    }

    getFillStyle() {
        let gradient = ctx.createRadialGradient(
            this.x + this.w / 2, this.y - this.h / 2, Math.min(this.w, this.h) / 4,
            this.x, this.y, Math.max(this.w, this.h) * 10
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, "#FFFFFF");
        return gradient;
    }

    increaseSize() {
        this.w += 2;
        this.h += 2;
        console.log(this.w, this.h);
        return this.w <= 70 && this.h <= 70;
    }

    draw() {
        ctx.fillStyle = this.getFillStyle();
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.closePath();
        ctx.fill();
    }
}

class Star extends Figure {
    constructor(x, y) {
        super(x, y);

        this.strokes = this.rndNumber(5, 10);
        this.innerRadius = this.rndNumber(10, 20);
        this.outerRadius = this.rndNumber(this.innerRadius + 5, this.innerRadius + 15);
    }

    draw() {
        ctx.fillStyle = this.color;

        let n = this.strokes;
        let r = this.innerRadius;
        let R = this.outerRadius;

        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.moveTo(0, 0 - r);

        for (let i = 0; i < n; i++) {
            ctx.rotate(Math.PI / n);
            ctx.lineTo(0, 0 - R);
            ctx.rotate(Math.PI / n);
            ctx.lineTo(0, 0 - r);
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    increaseSize() {
        this.innerRadius += 1;
        this.outerRadius += 3;
        return this.innerRadius <= 35;
    }
}

directionsList = {
    0: [1, 0],
    1: [-1, 0],
    2: [0, -1],
    3: [0, 1],
    4: [NaN, NaN],
};
figuresClasses = [Rectangle, Ball, Star]
let figures = [];
let canvas, ctx;
let started = false;
let direction = 0;
let speed = 1;
let idTimer;

function increaseSize() {
    drawBackground();

    for (let i = 0; i < figures.length; i++) {
        let result = figures[i].increaseSize();
        if (!result) {
            figures.splice(i--, 1);
        } else {
            figures[i].draw();
        }
    }
}

function setDirections() {
    for (let i = 0; i < figures.length; i++) {
        if (direction === 5) {
            figures[i].setDirection(rndDirection());
            continue;
        }

        figures[i].setDirection(direction);
    }
}

function rndDirection() {
    return +Math.floor(Math.random() * 4);
}

function changeSpeed(s) {
    speed += s;
    if (speed < 0) {
        speed = 0;
    }
}

function moveFigures() {
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;

    drawBackground();

    for (let i = 0; i < figures.length; i++) {
        figures[i].move();
        figures[i].draw();
        if (figures[i].x > w || figures[i].x < 0 || figures[i].y < 0 || figures[i].y > h) {
            figures.splice(i--, 1);
        }
    }
}

function addFigure(x, y) {
    let figureClass = figuresClasses[Math.floor(Math.random() * figuresClasses.length)];
    let item = new figureClass(x, y);


    item.setDirection(direction === 5 ? rndDirection() : direction);
    figures.push(item);
    item.draw(ctx);
}

function rndPlace() {
    return [
        10 + Math.random() * (canvas.width - 30),
        10 + Math.random() * (canvas.height - 30)
    ];
}

function drawBackground() {
    ctx.save();
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight);
    gradient.addColorStop(1, '#202020');
    gradient.addColorStop(0, '#AAAAAA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.restore();
}

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    drawBackground();

    for (let i = 1; i <= 10; i++) {
        let place = rndPlace(this.canvas);
        addFigure(place[0], place[1]);
    }
}

function start(dir) {
    direction = dir;
    setDirections();

    if (!started) {
        started = true;
        idTimer = setInterval('moveFigures();', 50);
    }
}

function stop() {
    started = false;
    clearInterval(idTimer);
}