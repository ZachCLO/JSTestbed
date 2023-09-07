import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './node_modules/three/examples/jsm/postprocessing/Pass.js';
import { CopyShader } from './node_modules/three/examples/jsm/shaders/CopyShader.js';

class DepthRenderPass extends Pass {

	constructor(map) {

		super();

		const shader = CopyShader;

		this.map = map;
		this.znear = 0.0;
		this.zfar = 1.0;

		this.uniforms = UniformsUtils.clone(shader.uniforms);
		this.uniforms['cameraNear'] = { value: this.znear };
		this.uniforms['cameraFar'] = { value: this.zfar };
		this.uniforms['tDepth'] = { value: this.map };

		this.material = new ShaderMaterial({

			uniforms: this.uniforms,
			vertexShader: /* glsl */`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}`,
			fragmentShader:  /* glsl */`
				#include <packing>
				uniform float cameraNear;
				uniform float cameraFar;
				uniform sampler2D tDepth;
				uniform sampler2D tDiffuse;
				varying vec2 vUv;
				float readDepth( sampler2D depthSampler, vec2 coord ) {
					float fragCoordZ = texture2D( tDepth, coord ).x;
					float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
					return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
				}	
				void main() {
					float depth = readDepth( tDepth, vUv );
					gl_FragColor.rgb = 1.0 - vec3( depth );
					gl_FragColor.a = 1.0;
				}`,
			depthTest: false,
			depthWrite: false,
			premultipliedAlpha: true

		});

		this.needsSwap = false;

		this.fsQuad = new FullScreenQuad(null);

	}

	render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.fsQuad.material = this.material;

		this.uniforms['cameraNear'].value = this.znear;
		this.uniforms['cameraFar'].value = this.zfar;
		this.uniforms['tDepth'].value = this.map;
		this.material.transparent = false;

		renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
		if (this.clear) renderer.clear();
		this.fsQuad.render(renderer);

		renderer.autoClear = oldAutoClear;

	}

	dispose() {

		this.material.dispose();

		this.fsQuad.dispose();

	}

	setCameraDepth(camera) {
		this.znear = camera.near;
		this.zfar = camera.far;
	}

}

export { DepthRenderPass };