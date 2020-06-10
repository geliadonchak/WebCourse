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

    move() {
        this.x -= this.speed;
        this.build();
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

    build() {
        this.segments = [];
        this.addSegment(this.x, this.y, this.x + this.size, this.y);
        this.addSegment(this.x + this.size, this.y, this.x + this.size, this.y - this.size);
        this.addSegment(this.x + this.size, this.y - this.size, this.x, this.y - this.size);
        this.addSegment(this.x, this.y - this.size ,this.x, this.y);
    }
}

class Star extends Enemy {
    constructor(x, y, size, speed, hp) {
        super(x, y, size, speed, hp);

        this.color = "darkred";
        this.strokes = 6;
        this.innerRadius = size / 2;
        this.outerRadius = size;
        this.build();
    }

    draw(ctx) {
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

    addSegment(x1, y1, x2, y2) {
        this.segments.push([x1, y1, x2, y2]);
    }

    build() {
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
}

class Pentagon extends Star {
    constructor(x, y, size, speed, hp) {
        super(x, y, size, speed, hp);

        this.color = "orangered";
        this.strokes = 5;
        this.outerRadius = size;
        let t = this.outerRadius * Math.sqrt(2 - 2 * Math.cos(72 * Math.PI / 180));
        this.innerRadius = Math.floor(Math.sqrt(Math.pow(size, 2) - Math.pow(t / 2, 2)));

        this.build();
    }
}