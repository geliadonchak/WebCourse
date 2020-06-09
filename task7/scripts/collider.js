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
}