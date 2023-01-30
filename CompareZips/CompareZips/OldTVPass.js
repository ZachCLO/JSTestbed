import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './node_modules/three/examples/jsm/postprocessing/Pass.js';
import { OldTVShader } from './OldTVShader.js';

class OldTVPass extends Pass {

	constructor() {

		super();

		const shader = OldTVShader;

		this.uniforms = UniformsUtils.clone(shader.uniforms);

		this.material = new ShaderMaterial({

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		});

		this.distortionFreq = 5.7;
		this.distortionScale = 6.0;
		this.distortionRoll = 0.4;
		this.interference = 0.49;
		this.frameLimit = 0.38;
		this.frameShape = 0.34;
		this.frameSharpness = 8.4;


		this.fsQuad = new FullScreenQuad(this.material);

	}

	render(renderer, writeBuffer, readBuffer, deltaTime /*, maskActive */) {

		this.uniforms['Image'].value = readBuffer.texture;
		this.uniforms['time'].value += deltaTime;

		if (this.renderToScreen) {

			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);

		} else {

			renderer.setRenderTarget(writeBuffer);
			if (this.clear) renderer.clear();
			this.fsQuad.render(renderer);

		}

	}

	dispose() {

		this.material.dispose();

		this.fsQuad.dispose();

	}

}

export { OldTVPass };