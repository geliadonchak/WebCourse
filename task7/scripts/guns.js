class GunFabric {
    static create(gunType, cannon) {
        switch (gunType) {
            case 0:
                return new CannonBall(cannon);
            case 1:
                return new CannonBlackHole(cannon);
            case 2:
                return new CannonMachineGun(cannon);
        }
    }
}

class Cannon extends GameObject {
    constructor(x, y, canvasWidth, canvasHeight) {
        super(x, y);

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.radius = 80;
        this.colorBase = "dimgray";
        this.colorBarrel = "gray";
        this.barrelWidth = 270;
        this.barrelHeight = 30;
    }

    getBarrelAngle() {
        let mousePos = MouseUtils.getMousePos();
        return -Math.atan((this.canvasHeight - mousePos.y) / mousePos.x)
    }

    checkCollapse() {
        return false;
    }

    draw(ctx) {
        let bW = this.barrelWidth;
        let bH = this.barrelHeight;

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = this.colorBarrel;
        ctx.translate(0, this.y);
        ctx.rotate(this.getBarrelAngle());
        ctx.rect(-bW / 2, -bH / 2, bW, bH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = this.colorBase;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class CannonBullet extends GameObject {
    constructor(cannon) {
        let x = cannon.barrelWidth / 2 * Math.cos(cannon.getBarrelAngle());
        let y = cannon.canvasHeight + cannon.barrelWidth / 2 * Math.sin(cannon.getBarrelAngle());

        super(x, y);

        this.radius = 15;
        this.color = "black";
        this.cannon = cannon;

        this.damage = 0;

        this.x_start = x;
        this.y_start = y;
        this.angle = this.cannon.getBarrelAngle();
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    checkCollapse() {
        return (this.x - this.radius) >= this.cannon.canvasWidth || (this.y - this.radius) >= this.cannon.canvasHeight ||
            (this instanceof CannonMachineGun && this.y + this.radius <= 0);
    }

    getDamage() {
        return this.damage;
    }

    getTimeout() {
        return this.timeout;
    }
}

class CannonBall extends CannonBullet {
    constructor(cannon) {
        super(cannon);
        this.v = 100;
        this.t = 0;

        this.damage = 3;
        this.timeout = 1000;
    }

    move() {
        this.t += 0.1;
        this.x = this.x_start + this.v * Math.cos(this.angle) * this.t;
        this.y = this.y_start + this.v * Math.sin(this.angle) * this.t + 5.5 * Math.pow(this.t, 2);
    }
}

class CannonBlackHole extends CannonBullet {
    constructor(cannon) {
        super(cannon);
        this.v = 200;
        this.m = 1;
        this.t = 0;

        this.damage = 0.5;
        this.timeout = 10000;
    }

    move() {
        this.t += 0.015;
        this.m += 0.05;
        this.radius += 0.3;
        this.x = this.x_start + this.v * Math.cos(this.angle) * this.t;
        this.y = this.y_start + this.v * Math.sin(this.angle) * this.t + 4 * this.m * Math.pow(this.t, 2);
    }
}

class CannonMachineGun extends CannonBullet {
    constructor(cannon) {
        super(cannon);
        this.radius = 5;

        this.v = 12;

        this.damage = 1;
        this.timeout = 100;

        let r = Math.sqrt(Math.pow(this.x_start, 2) + Math.pow(this.y_start - this.cannon.canvasHeight, 2));
        this.dx = this.x_start / r;
        this.dy = Math.abs(this.y_start - this.cannon.canvasHeight) / r;
    }

    move() {
        this.x += this.dx * this.v;
        this.y -= this.dy * this.v;
    }
}