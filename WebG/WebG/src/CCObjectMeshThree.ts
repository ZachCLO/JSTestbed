import { CCObject } from './CCObject.js';
import { CCMaterialThree } from './CCMaterialThree.js';
import { BufferGeometry, Mesh, Material, MeshBasicMaterial } from 'three';

class CCObjectMeshThree extends CCObject {

    tMesh: Mesh;
    tGeometry: BufferGeometry;
    tMaterial: Material = new MeshBasicMaterial({ color: 0xffffff });

    constructor(geometry: BufferGeometry, options?: any) {
        super(options);

        this.tGeometry = geometry;
        this.tMesh = new Mesh(this.tGeometry, this.tMaterial);
    }

    setMaterial(material: CCMaterialThree) {
        if (!material)
            return;

        if (!material.tMaterial)
            return;

        this.tMaterial = material.tMaterial;
        this.tMesh.material = this.tMaterial;
    }

}

export { CCObjectMeshThree };