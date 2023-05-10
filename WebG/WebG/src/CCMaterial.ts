import { CCColor } from './CCColor.js';

class CCMaterial {

    color: CCColor = new CCColor(1, 1, 1);

    constructor(options: any) {
        if (options) {
            if (options.color) {
                this.color = options.color;
            }
        }
    }

}

export { CCMaterial };