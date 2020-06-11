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

    static collideLineLine(seg1, seg2) {
        let l1 = Collider.getLineFromPoints(seg1);
        let l2 = Collider.getLineFromPoints(seg2);
        if (l1['A'] === 0) {
            let temp = l1;
            l1 = l2;
            l2 = temp;
        }

        if (l1['A'] * l2['B'] !== l2['A'] * l1['B']) {
            if (l1['A'] === 0) {
                let temp = l1;
                l1 = l2;
                l2 = temp;
            }

            let a1 = l1['A'];
            l1['C'] = -l1['C'];
            let a2 = l2['A'];
            l2['C'] = -l2['C'];

            l1['A'] /= a1;
            l1['B'] /= a1;
            l1['C'] /= a1;
            l2['A'] = 0;
            l2['B'] -= l1['B'] * a2;
            l2['C'] -= l1['C'] * a2;
            l2['C'] /= l2['B'];
            l2['B'] /= l2['B'];
            l1['C'] -= l1['B'] * l2['C'];
            l1['B'] = 0;

            let x = l1['C'], y = l2['C'];

            if (Collider.pointInSegment(x, y, seg1) && Collider.pointInSegment(x, y, seg2)) {
                return true;
            }
        }

        return false;
    }

    static collideCircleLine(bullet, seg) {
        let x1 = seg[0] - bullet.x;
        let y1 = seg[1] - bullet.y;
        let x2 = seg[2] - bullet.x;
        let y2 = seg[3] - bullet.y;

        let dx = x2 - x1;
        let dy = y2 - y1;

        let a = dx * dx + dy * dy;
        let b = 2 * (x1 * dx + y1 * dy);
        let c = x1 * x1 + y1 * y1 - bullet.radius * bullet.radius;

        if (-b < 0) {
            return (c < 0);
        }

        if (-b < (2 * a)) {
            return ((4 * a * c - b * b) < 0);
        }

        return (a + b + c < 0);
    }

    static collideBulletEnemy(bullet, enemy) {
        let segments = enemy.getSegments();

        for (let i = 0; i < segments.length; i++) {
            if (Collider.collideCircleLine(bullet, segments[i])) {
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
}