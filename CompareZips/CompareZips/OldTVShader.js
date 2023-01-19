const OldTVShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'time': { value: 0.0 },
		'time_cycle_period': { value: 120.0 },
		'flicker': { value: 1919.959961 },
		'DirtFrequency': { value: 27.070000 },
		'Noise2': { value: null },
		'Noise1': { value: null },
		'AddressTexture': { value: null },
		'DirtSprites': { value: null },
		'Grayscale': { value: true },
	},

	vertexShader: /* glsl */`
		varying vec2 vUV;
		void main() {
			vUV = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,

	fragmentShader: /* glsl */`
		#include <common>
		uniform float time;
		uniform sampler2D tDiffuse;
		uniform float time_cycle_period;
		uniform float flicker;
		uniform float DirtFrequency;
		uniform sampler2D Noise2;
		uniform sampler2D Noise1;
		uniform sampler2D AddressTexture;
		uniform sampler2D DirtSprites;
		uniform bool Grayscale;
		varying vec2 vUV;
		void main() {
			// sample background image
			vec4 background = texture2D(tDiffuse, vUV);
			if (Grayscale) {
				float gs = 0.3 * background.r + 0.4 * background.g + 0.3 * background.b;
				background = vec4(gs, gs, gs, background.a);
			}

			// get time into range [0, 1]
			vec2 timeScalar = vec2(time/time_cycle_period, 0.5);

			// get 2 random vectors
			vec4 randVec0 = texture2D(Noise1, timeScalar);
			vec4 randVec1 = texture2D(Noise2, timeScalar );

			// scale address texture
			float sizeScale = ((randVec0.r + randVec0.g + randVec0.b + randVec0.a) / 4.0) * 2.0;
			vec2 texCoord = fract((vUV + randVec1.xy) / vec2(DirtFrequency * (1.0+sizeScale), 200.0));

			// normalized sub-texel coords
			vec2 subTexelCoord0 = fract(texCoord.xy * 1024.0);
			subTexelCoord0.y = 1.0 - subTexelCoord0.y;

			// get sprite address   
			vec3 spriteCoords0 = texture2D (AddressTexture, texCoord.xy).xyz;

			// get sprite address into paged texture coords space
			spriteCoords0.xy = (spriteCoords0.xy * 8.0);
			spriteCoords0.xy = (spriteCoords0.xy - fract(spriteCoords0.xy)) / 8.0;
			spriteCoords0.xy = spriteCoords0.xy + (subTexelCoord0 * (1.0/8.0));

			vec4 o;
			o.rgba = texture2D(DirtSprites, spriteCoords0.xy);

			// scale by time such that screen flickers (scales from 0.5 to 1.0 and back again)

			// scale by flicker speed 
			float darken = fract(flicker * timeScalar.x);

			// we want darken to cycle between 0.5 and 1.0
			darken = abs(darken - 0.5) + 0.5;

			// scale background to make it flicker
			background = background * darken;

			// composite dirt onto film
			o.rgba *= background;

			gl_FragColor = o;
		}`,

};

export { OldTVShader };