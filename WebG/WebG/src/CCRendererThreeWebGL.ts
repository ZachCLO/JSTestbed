import { CCRendererThree } from './CCRendererThree.js';
import { WebGLRenderer } from 'three';

class CCRendererThreeWebGL extends CCRendererThree { 

    private renderer: WebGLRenderer;

    constructor(div: HTMLElement, options?: any) {
        super(div, options);

        const rc = this.div_base.getBoundingClientRect();

        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(rc.width, rc.height);
        if (this.clearColor)
            this.renderer.setClearColor(this.clearColor.asHexNumber(), 1);
        div.appendChild(this.renderer.domElement);
    }

    onResize(): void {
        super.onResize();

        if (this.renderer && this.div_base) {
            const rc = this.div_base.getBoundingClientRect();
            this.renderer.setSize(rc.width, rc.height);
        }
    }

    render(): void {
        super.render();

        this.renderer.clear();
        this.renderer.render(this.tScene, this.camera.tCamera);
    }


    
}

export { CCRendererThreeWebGL };