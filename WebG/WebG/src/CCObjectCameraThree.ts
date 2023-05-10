import { CCObjectCamera } from './CCObjectCamera.js';
import { Vector3, PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CCRendererThree } from './CCRendererThree.js';

class CCObjectCameraThree extends CCObjectCamera {

    tCamera: PerspectiveCamera;

    tControls: OrbitControls;

    tRenderer: CCRendererThree;

    constructor(renderer: CCRendererThree, options?: any) {
        super(options);

        this.tRenderer = renderer;

        this.tCamera = new PerspectiveCamera(this.fov, this.aspect, this.near, this.far);

        this.tControls = new OrbitControls(this.tCamera, this.tRenderer.div_base);

        this.tControls.enabled = true;
        this.tControls.target = new Vector3(0, 0, 0);
        this.tControls.reset();

    }

    setFov(fov: number) {
        super.setFov(fov);
        if (this.tCamera && this.fov)
            this.tCamera.fov = this.fov;
    }

    setAspect(aspect: number) {
        super.setAspect(aspect);
        if (this.tCamera && this.aspect)
            this.tCamera.aspect = this.aspect;
    }

    setNear(near: number) {
        super.setNear(near);
        if (this.tCamera && this.near)
            this.tCamera.near = this.near;
    }

    setFar(far: number) {
        super.setFar(far);
        if (this.tCamera && this.far)
            this.tCamera.far = this.far;
    }

    setPositionAndLookAt(pos: Vector3, target?: Vector3, up?: Vector3) {
        this.tCamera.position.copy(pos);
        if (up)
            this.tCamera.up.copy(up);
        if (target)
            this.tCamera.lookAt(target);
    }
    
}

export { CCObjectCameraThree };