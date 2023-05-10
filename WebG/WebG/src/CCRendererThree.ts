import { CCRenderer } from './CCRenderer.js';
import { Scene, BufferGeometry } from 'three';
import { CCObjectCameraThree } from './CCObjectCameraThree.js';
import { CCObjectMeshThree } from './CCObjectMeshThree.js';
import { CCMaterialThree } from './CCMaterialThree.js';

class CCRendererThree extends CCRenderer { 

    tScene: Scene;

    camera: CCObjectCameraThree;

    constructor(div: HTMLElement, options?: any) {
        super(div, options);

        this.tScene = new Scene();

        this.camera = new CCObjectCameraThree(this, options);
    }

    onResize(): void {
        super.onResize();
    }

    render(): void {
        super.render();
    }

    createMeshWithGeometry(geometry: BufferGeometry, material?: CCMaterialThree, options?: any): CCObjectMeshThree | null {
        if (!geometry)
            return null;

        const mesh = new CCObjectMeshThree(geometry, options);
        this.tScene.add(mesh.tMesh);

        if (material)
            mesh.setMaterial(material);

        return mesh;
    }

}

export { CCRendererThree };