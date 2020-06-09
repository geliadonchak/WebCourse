class Enemy extends GameObject {
    hp;
    speed;
    size;

    constructor(x, y, size, speed, hp) {
        super(x, y);
        this.size = size;
        this.speed = speed;
        this.hp = hp;
        this.segments = [];
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        let seg = this.segments;

        ctx.fillStyle = this.color;
        ctx.moveTo(this.x, this.y);
        for (let i = 0; i < seg.length; i++) {
            ctx.lineTo(seg[i][2], seg[i][3]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    build() {

    }

    addSegment(x1, y1, x2, y2) {
        this.segments.push([x1, y1, x2, y2]);
    }

    checkCollapse() {
        return this.x <= 0;
    }

    getSegments() {
        return this.segments;
    }
}

class Triangle extends Enemy {
    constructor(x, y, size, speed, hp) {
        super(x, y, size, speed, hp);

        this.color = "lime";
        this.build();
    }

    move() {
        this.x -= this.speed;
        this.build();
    }

    build() {
        this.segments = [];
        this.addSegment(this.x, this.y, this.x + this.size, this.y);
        this.addSegment(this.x + this.size, this.y, this.x + this.size / 2, this.y - this.size * Math.ceil(Math.sqrt(3) / 2));
        this.addSegment(this.x + this.size / 2, this.y - this.size * Math.ceil(Math.sqrt(3) / 2), this.x, this.y);
    }
}

class Square extends Enemy {
    constructor(x, y, size, speed, hp) {
        super(x, y, size, speed, hp);

        this.color = "gold";
        this.build();
    }

    move() {
        this.x -= this.speed;
        this.build();
    }

    build() {
        this.segments = [];
        this.addSegment(this.x, this.y, this.x + this.size, this.y);
        this.addSegment(this.x + this.size, this.y, this.x + this.size, this.y - this.size);
        this.addSegment(this.x + this.size, this.y - this.size, this.x, this.y - this.size);
        this.addSegment(this.x, this.y - this.size ,this.x, this.y);
    }
}