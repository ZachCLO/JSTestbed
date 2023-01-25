import {
	AdditiveBlending,
	Color,
	DoubleSide,
	Matrix4,
	MeshDepthMaterial,
	NoBlending,
	RGBADepthPacking,
	ShaderMaterial,
	UniformsUtils,
	Vector2,
	Vector3,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from './node_modules/three/examples/jsm/postprocessing/Pass.js';
import { CopyShader } from './node_modules/three/examples/jsm/shaders/CopyShader.js';

class CartoonPass extends Pass {

	constructor(resolution, scene, camera) {

		super();

		this.renderScene = scene;
		this.renderCamera = camera;

		this.visibleEdgeColor = new Color(1, 1, 1);
		this.hiddenEdgeColor = new Color(0.1, 0.04, 0.02);

		this.edgeThickness = 1.0;
		this.edgeStrength = 3.0;

		this._visibilityCache = new Map();


		this.resolution = (resolution !== undefined) ? new Vector2(resolution.x, resolution.y) : new Vector2(256, 256);

		const resx = Math.round(this.resolution.x / this.downSampleRatio);
		const resy = Math.round(this.resolution.y / this.downSampleRatio);

		this.depthMaterial = new MeshDepthMaterial();
		this.depthMaterial.side = DoubleSide;
		this.depthMaterial.depthPacking = RGBADepthPacking;
		this.depthMaterial.blending = NoBlending;

		this.renderTargetDepthBuffer = new WebGLRenderTarget(this.resolution.x, this.resolution.y);
		this.renderTargetDepthBuffer.texture.name = 'OutlinePass.depth';
		this.renderTargetDepthBuffer.texture.generateMipmaps = false;

		this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
		this.renderTargetEdgeBuffer1 = new WebGLRenderTarget(resx, resy);
		this.renderTargetEdgeBuffer1.texture.name = 'OutlinePass.edge1';
		this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;

		const MAX_EDGE_THICKNESS = 4;
		const MAX_EDGE_GLOW = 4;

		// Overlay material
		this.overlayMaterial = this.getOverlayMaterial();

		// copy material
		if (CopyShader === undefined) console.error('THREE.OutlinePass relies on CopyShader');

		const copyShader = CopyShader;

		this.copyUniforms = UniformsUtils.clone(copyShader.uniforms);
		this.copyUniforms['opacity'].value = 1.0;

		this.materialCopy = new ShaderMaterial({
			uniforms: this.copyUniforms,
			vertexShader: copyShader.vertexShader,
			fragmentShader: copyShader.fragmentShader,
			blending: NoBlending,
			depthTest: false,
			depthWrite: false,
			transparent: true
		});

		this.enabled = true;
		this.needsSwap = false;

		this._oldClearColor = new Color();
		this.oldClearAlpha = 1;

		this.fsQuad = new FullScreenQuad(null);

		this.tempPulseColor1 = new Color();
		this.tempPulseColor2 = new Color();
		this.textureMatrix = new Matrix4();

		function replaceDepthToViewZ(string, camera) {

			const type = camera.isPerspectiveCamera ? 'perspective' : 'orthographic';

			return string.replace(/DEPTH_TO_VIEW_Z/g, type + 'DepthToViewZ');

		}

	}

	dispose() {

		this.renderTargetMaskBuffer.dispose();
		this.renderTargetDepthBuffer.dispose();
		this.renderTargetMaskDownSampleBuffer.dispose();
		this.renderTargetBlurBuffer1.dispose();
		this.renderTargetBlurBuffer2.dispose();
		this.renderTargetEdgeBuffer1.dispose();
		this.renderTargetEdgeBuffer2.dispose();

		this.depthMaterial.dispose();
		this.prepareMaskMaterial.dispose();
		this.edgeDetectionMaterial.dispose();
		this.separableBlurMaterial1.dispose();
		this.separableBlurMaterial2.dispose();
		this.overlayMaterial.dispose();
		this.materialCopy.dispose();

		this.fsQuad.dispose();

	}

	setSize(width, height) {

		this.renderTargetEdgeBuffer1.setSize(width, height);

	}

	updateTextureMatrix() {

		this.textureMatrix.set(0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.5, 0.5,
			0.0, 0.0, 0.0, 1.0);
		this.textureMatrix.multiply(this.renderCamera.projectionMatrix);
		this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);

	}

	render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {

		renderer.getClearColor(this._oldClearColor);
		this.oldClearAlpha = renderer.getClearAlpha();
		const oldAutoClear = renderer.autoClear;

		renderer.autoClear = false;

		renderer.setClearColor(0x000000, 0);

		const currentBackground = this.renderScene.background;
		this.renderScene.background = null;


		this.renderScene.overrideMaterial = this.edgeDetectionMaterial;
		this.edgeDetectionMaterial.uniforms['visibleEdgeColor'].value = this.visibleEdgeColor;
		//this.cartoonEdgeMaterial.uniforms['cameraNearFar'].value.set(this.renderCamera.near, this.renderCamera.far);
		//this.cartoonEdgeMaterial.uniforms['depthTexture'].value = this.renderTargetDepthBuffer.texture;
		//this.cartoonEdgeMaterial.uniforms['textureMatrix'].value = this.textureMatrix;
		renderer.setRenderTarget(this.renderTargetEdgeBuffer1);
		renderer.clear();
		renderer.render(this.renderScene, this.renderCamera);
		this.renderScene.overrideMaterial = null;

		this.renderScene.background = currentBackground;

		
		// Blend it additively over the input texture
		this.fsQuad.material = this.overlayMaterial;
		this.overlayMaterial.uniforms['edgeTexture1'].value = this.renderTargetEdgeBuffer1.texture;
		//this.overlayMaterial.uniforms['edgeStrength'].value = this.edgeStrength;
		//this.overlayMaterial.uniforms['edgeGlow'].value = this.edgeGlow;
		//this.overlayMaterial.uniforms['usePatternTexture'].value = this.usePatternTexture;


		renderer.setRenderTarget(readBuffer);
		this.fsQuad.render(renderer);

		renderer.setClearColor(this._oldClearColor, this.oldClearAlpha);
		renderer.autoClear = oldAutoClear;

		if (this.renderToScreen) {

			this.fsQuad.material = this.materialCopy;
			this.copyUniforms['tDiffuse'].value = readBuffer.texture;
			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);

		}

	}

	getEdgeDetectionMaterial() {

		return new ShaderMaterial({

			uniforms: {
				'visibleEdgeColor': { value: new Vector3(1.0, 1.0, 1.0) },
			},

			vertexShader:
				`varying float dotN;

				void main()	{
					vec3 cdir = normalize(cameraPosition.xyz - position.xyz);
					dotN = max(0.0, dot(cdir, normal));
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}`,

			fragmentShader:
				`varying float dotN;
				uniform vec3 visibleEdgeColor;
				void main()	{

					vec4 fColor = vec4(1, 1, 1, 0);
					if (dotN < 0.1) {
						fColor = vec4(0, 0, 0, 1);
					} else if (dotN < 0.5) {
						fColor = vec4(0.3, 0.3, 0.3, 0);
					} else if (dotN < 0.75) {
						fColor = vec4(0.6, 0.6, 0.6, 0);
					} else {
						fColor = vec4(1, 1, 1, 0);
					}
					gl_FragColor = fColor;
				}`,
		});

	}

	getOverlayMaterial() {

		return new ShaderMaterial({

			uniforms: {
				'edgeTexture1': { value: null },
			},

			vertexShader:
				`varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,

			fragmentShader:
				`varying vec2 vUv;

				uniform sampler2D edgeTexture1;

				void main() {
					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
					gl_FragColor = edgeValue1;
				}`,
			//blending: AdditiveBlending,
			depthTest: false,
			depthWrite: false,
			transparent: true
		});

	}

}

export { CartoonPass };
