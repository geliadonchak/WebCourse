class Collider {
    static getLineFromPoints(seg) {
        let a = seg[1] - seg[3];
        let b = seg[2] - seg[0];
        let c = seg[0] * seg[3] - seg[2] * seg[1];
        return {'A': a, 'B': b, 'C': c}
    }

    static pointInSegment(x, y, seg) {
        let min_x = Math.min(seg[0], seg[2]);
        let max_x = Math.max(seg[0], seg[2]);
        let min_y = Math.min(seg[1], seg[3]);
        let max_y = Math.max(seg[1], seg[3]);

        return min_x <= x && x <= max_x && min_y <= y && y <= max_y;
    }

    static collideBallBall(b1, b2) {
        let r = Math.sqrt(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2));
        return r <= b1.radius + b2.radius;
    }

    static collideBallStar(ball, star) {
        let r = Math.sqrt(Math.pow(ball.x - star.x, 2) + Math.pow(ball.y - star.y, 2));
        return r <= ball.radius + star.outerRadius;
    }

    static collideLineLine(seg1, seg2) {
        let l1 = Collider.getLineFromPoints(seg1);
        let l2 = Collider.getLineFromPoints(seg2);

        if (l1['A'] * l2['B'] !== l2['A'] * l1['B']) {
            let y = (l2['A'] * l1['C'] - l2['C'] * l1['A']) / (l2['B'] * l1['A'] - l2['A'] * l1['B']);
            let x = (-l1['C'] - l1['B'] * y) / l1['A'];

            if (Collider.pointInSegment(x, y, seg1) && Collider.pointInSegment(x, y, seg2)) {
                return true;
            }
        }

        return false;
    }

    static collideLineFigures(fig1, fig2) {
        let seg1 = fig1.getSegments();
        let seg2 = fig2.getSegments();
        for (let i = 0; i < seg1.length; i++) {
            for (let j = 0; j < seg2.length; j++) {
                if (Collider.collideLineLine(seg1[i], seg2[j])) {
                    return true;
                }
            }
        }

        return false;
    }

    static collideBorder(figure, w, h) {
        if (figure instanceof Ball) {
            return (figure.y - figure.radius) <= 0 || (figure.y + figure.radius) >= h ||
                (figure.x - figure.radius) <= 0 || (figure.x + figure.radius) >= w;
        } else if (figure instanceof Star) {
            return (figure.x - figure.outerRadius) <= 0 || (figure.x + figure.outerRadius) >= w ||
                (figure.y - figure.outerRadius) <= 0 || (figure.y + figure.outerRadius) >= h;
        } else if (figure instanceof Rectangle) {
            return figure.x <= 0 || figure.x + figure.w >= w || figure.y <= 0 || figure.y + figure.h >= h;
        } else return true;
    }

    static collideBallRect(ball, rect) {
        let xx = ball.x;
        let yy = ball.y;

        if (ball.x < rect.x) {
            xx = rect.x;
        } else if (ball.x > rect.x + rect.w) {
            xx = rect.x + rect.w;
        }

        if (ball.y < rect.y) {
            yy = rect.y;
        } else if (ball.y > rect.y + rect.h) {
            yy = rect.y + rect.h;
        }

        let distX = ball.x - xx;
        let distY = ball.y - yy;
        let distance = Math.sqrt((distX * distX) + (distY * distY));

        return distance <= ball.radius;
    }

    static collideRectRect(rec1, rec2) {
        return (rec1.x <= rec2.x && rec1.x + rec1.w >= rec2.x || rec1.x <= rec2.x + rec2.w && rec1.x + rec1.w >= rec2.x + rec2.w) &&
            (rec1.y <= rec2.y && rec1.y + rec1.h >= rec2.y || rec1.y <= rec2.y + rec2.h && rec1.y + rec1.h >= rec2.y + rec2.h);
    }
}

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

    collide(figure) {
        if (figure instanceof Ball) {
            return Collider.collideBallBall(this, figure);
        } else if (figure instanceof Rectangle) {
            return Collider.collideBallRect(this, figure)
        } else if (figure instanceof Star) {
            return Collider.collideBallStar(this, figure);
        } else return true;
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
        return this.w <= 70 && this.h <= 70;
    }

    collide(figure) {
        if (figure instanceof Ball) {
            return Collider.collideBallRect(figure, this);
        } else if (figure instanceof Rectangle) {
            return Collider.collideRectRect(figure, this);
        } else if (figure instanceof Star) {
            return Collider.collideLineFigures(this, figure);
        } else return true;
    }

    draw() {
        ctx.fillStyle = this.getFillStyle();
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.closePath();
        ctx.fill();
    }

    getSegments() {
        return [
            [this.x, this.y, this.x, this.y + this.h],
            [this.x, this.y + this.h, this.x + this.w, this.y + this.h],
            [this.x + this.w, this.y + this.h, this.x + this.w, this.y],
            [this.x + this.w, this.y, this.x, this.y]
        ]
    }
}

class Star extends Figure {
    constructor(x, y) {
        super(x, y);

        this.strokes = this.rndNumber(5, 10);
        this.innerRadius = this.rndNumber(10, 20);
        this.outerRadius = this.rndNumber(this.innerRadius + 5, this.innerRadius + 15);
        this.buildStar();
    }

    draw() {
        this.buildStar();

        ctx.fillStyle = this.color;

        ctx.save();
        ctx.beginPath();

        let segments = this.getSegments();

        ctx.moveTo(segments[0][2], segments[0][3]);

        for (let i = 1; i < segments.length; i++) {
            ctx.lineTo(segments[i][2], segments[i][3]);
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    collide(figure) {
        if (figure instanceof Ball) {
            return Collider.collideBallStar(this, figure);
        } else if (figure instanceof Rectangle) {
            return Collider.collideLineFigures(this, figure);
        } else if (figure instanceof Star) {
            return Collider.collideLineFigures(this, figure);
        } else return true;
    }

    addSegment(x1, y1, x2, y2) {
        this.segments[this.segments.length] = [x1, y1, x2, y2];
    }

    buildStar() {
        this.segments = [];

        let rot = Math.PI / 2 * 3;
        let step = Math.PI / this.strokes;

        let r = this.innerRadius;
        let R = this.outerRadius;

        let x = this.x;
        let y = this.y;
        let x1 = this.x;
        let y1 = this.y - R;

        this.addSegment(x, y, x1, y1);
        x = x1;
        y = y1;

        for (let i = 0; i < this.strokes; i++) {
            x1 = this.x + Math.cos(rot) * R;
            y1 = this.y + Math.sin(rot) * R;

            this.addSegment(x, y, x1, y1);
            x = x1;
            y = y1;

            rot += step

            x1 = this.x + Math.cos(rot) * r;
            y1 = this.y + Math.sin(rot) * r;

            this.addSegment(x, y, x1, y1);
            x = x1;
            y = y1;

            rot += step
        }

        this.addSegment(x, y, this.x, this.y - R);
    }

    getSegments() {
        return this.segments;
    }

    increaseSize() {
        this.innerRadius += 1;
        this.outerRadius += 3;

        this.buildStar();

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

        if (Collider.collideBorder(figures[i], w, h)) {
            figures.splice(i--, 1);
            continue;
        }

        let remove_i = false;
        for (let j = 0; j < figures.length; j++) {
            if (i !== j && figures[j].collide(figures[i])) {
                remove_i = true;
                figures.splice(j--, 1);
                if (j < i) i--;
            }
        }

        if (remove_i) {
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