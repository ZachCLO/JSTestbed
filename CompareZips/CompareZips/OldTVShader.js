const OldTVShader = {

	uniforms: {

		'Image': { value: null },
		'Noise': { value: null },
		'Rand': { value: null },
		'time': { value: 0.0 },
		'distortionFreq': { value: 5.7 },
		'distortionScale': { value: 6.0 },
		'distortionRoll': { value: 0.4 },
		'interference': { value: 0.49 },
		'frameLimit': { value: 0.38 },
		'frameShape': { value: 0.34 },
		'frameSharpness': { value: 8.4 },
	},

	vertexShader: /* glsl */`
		varying vec2 vPos;
		varying vec2 vUV;
		void main() {
			vec2 Pos = sign(position.xy);
			
			gl_Position = projectionMatrix * modelViewMatrix * vec4(Pos.xy, 0.0, 1.0);
			vUV = Pos * 0.5 + 0.5;
			vPos = Pos;			
		}`,

	fragmentShader: /* glsl */`
		precision highp float;
		precision mediump sampler3D;

		uniform float distortionFreq;
		uniform float distortionScale;
		uniform float distortionRoll;
		uniform float interference;
		uniform float frameLimit;
		uniform float frameShape;
		uniform float frameSharpness;
		uniform float time;

		uniform sampler2D Image;
		uniform sampler3D Noise;
		uniform sampler3D Rand;

		varying vec2 vUV;
		varying vec2 vPos;

		void main(void)
		{
		   // Define a frame shape
		   float f = (1.0 - vPos.x * vPos.x) * (1.0 - vPos.y * vPos.y);
		   float frame = clamp(frameSharpness * (pow(f, frameShape) - frameLimit), 0.0, 1.0);
   
		   // Interference ... just a texture filled with rand()
		   float rand = 1.0;// float(texture(Rand, vec3(1.5 * vPos, time))) - 0.2;
   
		   // Some signed noise for the distortion effect
		   float noisy = 1.0; //float(texture(Noise, vec3(0.0, 0.5 * vPos.y, 0.1 * time))) - 0.5;
   
		   // Repeat a 1 - x^2 (0 < x < 1) curve and roll it with sinus.
		   float dst = fract(vPos.y * distortionFreq + distortionRoll * sin(time));
		   dst *= (1.0 - dst);
   
		   // Make sure distortion is highest in the center of the image
		   dst /= 1.0 + distortionScale * abs(vPos.y);
   
		   // ... and finally distort
		   vec2 texCoord = vUV;
		   texCoord.x += distortionScale * noisy * dst;
		   vec4 image = texture2D(Image, texCoord.xy);
   
		   // Combine frame, distorted image and interference
		   gl_FragColor = frame * (interference * rand + image);
		}`,

};

export { OldTVShader };