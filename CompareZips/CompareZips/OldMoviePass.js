import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './node_modules/three/examples/jsm/postprocessing/Pass.js';
import { OldMovieShader } from './OldMovieShader.js';

class OldMoviePass extends Pass {

	constructor() {

		super();

		const shader = OldMovieShader;

		this.uniforms = UniformsUtils.clone(shader.uniforms);

		this.material = new ShaderMaterial({

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		});

		this.grayScale = true;
		this.timeCyclePeriod = 120.0;
		this.flicker = 1919.959961;
		this.dirtFrequency = 27.07;

		//if (grayscale !== undefined) this.uniforms.grayscale.value = grayscale;
		//if (noiseIntensity !== undefined) this.uniforms.nIntensity.value = noiseIntensity;
		//if (scanlinesIntensity !== undefined) this.uniforms.sIntensity.value = scanlinesIntensity;
		//if (scanlinesCount !== undefined) this.uniforms.sCount.value = scanlinesCount;

		this.fsQuad = new FullScreenQuad(this.material);

	}

	render(renderer, writeBuffer, readBuffer, deltaTime /*, maskActive */) {

		this.uniforms['tDiffuse'].value = readBuffer.texture;
		this.uniforms['time'].value += deltaTime;

		this.uniforms['Grayscale'].value = this.grayScale;
		this.uniforms['time_cycle_period'].value = this.timeCyclePeriod;
		this.uniforms['flicker'].value = this.flicker;
		this.uniforms['DirtFrequency'].value = this.dirtFrequency;

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

export { OldMoviePass };