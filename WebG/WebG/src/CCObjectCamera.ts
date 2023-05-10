import { CCObject } from './CCObject.js';

class CCObjectCamera extends CCObject {

    fov: number = 50;
    aspect: number = 1.0;
    near: number = 1.0;
    far: number = 100.0;

    constructor(options: any) {
        super(options);

        this.setFov(options?.fov);
        this.setAspect(options?.aspect);
        this.setNear(options?.near);
        this.setFar(options?.far);
    }

    setFov(fov: number) {
        if (fov)
            this.fov = fov;
    }

    setAspect(aspect: number) {
        if (aspect)
            this.aspect = aspect;
    }

    setNear(near: number) {
        if (near)
            this.near = near;
    }

    setFar(far: number) {
        if (far)
            this.far = far;
    }

}

export { CCObjectCamera };