uniform sampler2DRect src_tex_unit0;
uniform float imgWidth;
uniform float imgHeight;
uniform float time;
uniform float speed;
float texelWidth =  1.0 ; //size of one texel;

// NOTE: we should initialize these arrays up here
//               but that syntax doesn't work on OSX for some reason
//               so we set these array values in main(), which
//       is bad for performance, but works on OSX

float kernel[9];
vec2 offset[9];

float step_w = 1.0;
float step_h = 1.0;



vec3 rainbow(float h) {
	h = mod(mod(h, 1.0) + 1.0, 1.0);
	float h6 = h * 6.0;
	float r = clamp(h6 - 4.0, 0.0, 1.0) +
    clamp(2.0 - h6, 0.0, 1.0);
	float g = h6 < 2.0
    ? clamp(h6, 0.0, 1.0)
    : clamp(4.0 - h6, 0.0, 1.0);
	float b = h6 < 4.0
    ? clamp(h6 - 2.0, 0.0, 1.0)
    : clamp(6.0 - h6, 0.0, 1.0);
	return vec3(r, g, b);
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    //vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    //vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
    vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(( (q.z + (q.w - q.y) / (6.0 * d + e))) ), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    
    
    vec2 tc = gl_TexCoord[0].st;
    vec4 input0 = texture2DRect(src_tex_unit0,tc);
    
    /*
    vec2 x1 = vec2(1.0,0.0);
    vec2 y1 = vec2(0.0,1.0);
    
    input0 += texture2DRect(src_tex_unit0, tc+x1);
    input0 += texture2DRect(src_tex_unit0, tc-x1);
    input0 += texture2DRect(src_tex_unit0, tc+y1);
    input0 += texture2DRect(src_tex_unit0, tc-y1);
    
    input0*= vec4(0.2);
    */
    
    float co = cos(time*speed);
    float si = sin(time*speed);
    
    mat4 hueRotation =
    mat4(0.299,  0.587,  0.114, 0.0,
         0.299,  0.587,  0.114, 0.0,
         0.299,  0.587,  0.114, 0.0,
         0.000,  0.000,  0.000, 1.0) +
    
    mat4(0.701, -0.587, -0.114, 0.0,
         -0.299,  0.413, -0.114, 0.0,
         -0.300, -0.588,  0.886, 0.0,
         0.000,  0.000,  0.000, 0.0) * co +
    
    mat4(0.168,  0.330, -0.497, 0.0,
         -0.328,  0.035,  0.292, 0.0,
         1.250, -1.050, -0.203, 0.0,
         0.000,  0.000,  0.000, 0.0) * si;
    
    
    float tl = abs(texture2DRect(src_tex_unit0, gl_TexCoord[0].st + texelWidth * vec2(-1.0, -1.0)).x);   // top left
    float  l = abs(texture2DRect(src_tex_unit0, gl_TexCoord[0].st + texelWidth * vec2(-1.0,  0.0)).x);   // left
    float bl = abs(texture2DRect(src_tex_unit0, gl_TexCoord[0].st + texelWidth * vec2(-1.0,  1.0)).x);   // bottom left
    float  t = abs(texture2DRect(src_tex_unit0, gl_TexCoord[0].st + texelWidth * vec2( 0.0, -1.0)).x);   // top
    float  b = abs(texture2DRect(src_tex_unit0, gl_TexCoord[0].st + texelWidth * vec2( 0.0,  1.0)).x);   // bottom
    float tr = abs(texture2DRect(src_tex_unit0, gl_TexCoord[0].st + texelWidth * vec2( 1.0, -1.0)).x);   // top right
    float  r = abs(texture2DRect(src_tex_unit0, gl_TexCoord[0].st + texelWidth * vec2( 1.0,  0.0)).x);   // right
    float br = abs(texture2DRect(src_tex_unit0, gl_TexCoord[0].st + texelWidth * vec2( 1.0,  1.0)).x);   // bottom right
	// Compute dx using Sobel:
    //           -1 0 1
    //           -2 0 2
    //           -1 0 1
    float dX = tr + 2.0*r + br -tl - 2.0*l - bl;
    // Compute dy using Sobel:
    //           -1 -2 -1
    //            0  0  0
    //            1  2  1
    float dY = bl + 2.0*b + br -tl - 2.0*t - tr;
    
    
    
    vec4 color = vec4(normalize(vec3(dX,dY,1.0/100.0)),1.0);
    
    color*=0.5;
    color+=0.5;
    
    //gl_FragColor = color * hueRotation;
    
    
    const float scale = 2.5;
	
	const float startA = 563.0 / 512.0;
	const float startB = 233.0 / 512.0;
	const float startC = 4325.0 / 512.0;
	const float startD = 312556.0 / 512.0;
	
	const float advanceA = 6.34 / 512.0 * 18.2;
	const float advanceB = 4.98 / 512.0 * 18.2;
	const float advanceC = 4.46 / 512.0 * 18.2;
	const float advanceD = 5.72 / 512.0 * 18.2;
	
	//vec2 uv = tc;
    vec2 uv = gl_FragCoord.xy * scale / vec2(1000,1000);
	
	float a = startA + time * advanceA;
	float b2 = startB + time * advanceB;
	float c = startC + time * advanceC;
	float d = startD + time * advanceD;
	
	float n = sin(a + 300.0 * uv.x) +
    sin(b2 - 40.0 * uv.x) +
    sin(c + 2.0 * uv.y) +
    sin(d + 5.0 * uv.y);
	
	//n = mod(((4.0 + n) / 0.001), 1.0);
    
    
    
    //hue.rgb += (sin(hue.rgb*0.5*time));
    

    
    vec4 hue = vec4(vec3(rgb2hsv(input0.rgb)),1.0);
    hue += sin(time);
    //hue*=0.5;
    //hue+=0.5;
    
    vec4 b2rgb = vec4(vec3(hsv2rgb(hue.rgb)),1.0);
    //b2rgb += sin(time);
    //vec4 final = vec4(vec3(sin(input0.rgb*40.141592*time)),0.25);
    //final = normalize(final*hue);
    //final += vec4(vec3(0.95),1.0);
    gl_FragColor = abs(b2rgb);
    
    
}