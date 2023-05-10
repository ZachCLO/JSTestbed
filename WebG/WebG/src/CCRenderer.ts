import { CCColor } from './CCColor.js';

class CCRenderer {

    div_base: HTMLElement;

    clearColor: CCColor = new CCColor(0, 0, 0);

    constructor(div: HTMLElement, options?: any) {
        this.div_base = div;

        if (options?.clear) {
            this.clearColor = options.clear;
        }
        
        window.addEventListener('resize', () => {
            this.onResize();
        });
    }

    onResize(): void {
        console.log("[CCrenderer] resize");
    }

    render(): void {
    }
    
}

export { CCRenderer };