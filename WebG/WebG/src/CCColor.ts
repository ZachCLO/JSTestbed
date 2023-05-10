
class CCColor {

    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        if (this.r > 1.0) this.r = 1.0;
        else if (this.r < 0.0) this.r = 0.0;
        if (this.g > 1.0) this.g = 1.0;
        else if (this.g < 0.0) this.g = 0.0;
        if (this.b > 1.0) this.b = 1.0;
        else if (this.b < 0.0) this.b = 0.0;
    }

    asFloatArray(): number[] {
        return [this.r, this.g, this.b];
    }

    asIntArray(): number[] {
        const ir = Math.floor(this.r * 255.0);
        const ig = Math.floor(this.g * 255.0);
        const ib = Math.floor(this.b * 255.0);
        return [ir, ig, ib];
    }

    asHexString(): string {
        let sr = Math.floor(this.r * 255.0).toString(16);
        let sg = Math.floor(this.g * 255.0).toString(16);
        let sb = Math.floor(this.b * 255.0).toString(16);
        if (sr.length < 2) sr = "0" + sr;
        if (sg.length < 2) sg = "0" + sg;
        if (sb.length < 2) sb = "0" + sb;
        return "0x" + sr + sg + sb;
    }

    asHexNumber(): number {
        const hex = this.asHexString();
        return parseInt(hex);
    }

}

export { CCColor };