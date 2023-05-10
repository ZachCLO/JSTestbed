import { CCMaterial } from './CCMaterial.js';
import { Color, Material, MeshBasicMaterial, MeshStandardMaterial, MeshLambertMaterial, MeshPhongMaterial } from 'three';

class CCMaterialThree extends CCMaterial {

    tMaterial: Material = new MeshBasicMaterial();

    constructor(options: any) {
        super(options);

        if (options?.quality) {
            if (options.quality == "basic")
                this.tMaterial = new MeshBasicMaterial({ color: this.color.asHexNumber() });
            else if (options.quality == "standard")
                this.tMaterial = new MeshStandardMaterial({ color: this.color.asHexNumber() });
            else if (options.quality == "lambert")
                this.tMaterial = new MeshLambertMaterial({ color: this.color.asHexNumber() });
            else if (options.quality == "phong")
                this.tMaterial = new MeshPhongMaterial({ color: this.color.asHexNumber() });
            else
                this.tMaterial = new MeshBasicMaterial({ color: this.color.asHexNumber() });
        } else {
            this.tMaterial = new MeshBasicMaterial({ color: this.color.asHexNumber() });
        }
        
    }

}

export { CCMaterialThree };