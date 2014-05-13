uniform sampler2DRect src_tex_unit0;
uniform float imgWidth;
uniform float imgHeight;

// NOTE: we should initialize these arrays up here
//               but that syntax doesn't work on OSX for some reason
//               so we set these array values in main(), which
//       is bad for performance, but works on OSX

float kernel[9];
float kernel2[9];
float kernel3[9];
vec2 offset[9];

float step_w = 1.0;
float step_h = 1.0;

void main() {
    
    
    vec2 tc = gl_TexCoord[0].st;
    vec4 input0 = texture2DRect(src_tex_unit0,tc);
    
    vec2 x1 = vec2(1.000, 0.0);
    vec2 y1 = vec2(0.0, 1.000);
    vec2 xy1 = vec2(1.000, 1.000);
    vec2 xy2 = vec2(-1.000, 1.000);
    vec2 xy3 = vec2(1.000, -1.000);
    
    
    input0 += texture2DRect(src_tex_unit0, tc+x1); // right
    input0 += texture2DRect(src_tex_unit0, tc-x1); // left
    input0 += texture2DRect(src_tex_unit0, tc+y1); // top
    input0 += texture2DRect(src_tex_unit0, tc-y1); // bottom
    
    //input0 += texture2DRect(src_tex_unit0, tc-xy1); // bottom left
    //input0 += texture2DRect(src_tex_unit0, tc+xy1); // top right
    //input0 += texture2DRect(src_tex_unit0, tc+xy2); // top left
    //input0 += texture2DRect(src_tex_unit0, tc+xy3); // top left
    
    
    input0*= vec4(0.2);
    

    
    offset[0] = vec2(-step_w, -step_h);
    offset[1] = vec2(0.0, -step_h);
    offset[2] = vec2(step_w, -step_h);
    offset[3] = vec2(-step_w, 0.0);
    offset[4] = vec2(0.0, 0.0);
    offset[5] = vec2(step_w, 0.0);
    offset[6] = vec2(-step_w, step_h);
    offset[7] = vec2(0.0, step_h);
    offset[8] = vec2(step_w, step_h);
    
    
    /* SHARPEN KERNEL
     0 -1  0
     -1  5 -1
     0 -1  0
     */
    
    kernel[0] = 1.0; kernel[1] = 1.0; kernel[2] = 1.0;
    kernel[3] = 1.0; kernel[4] = 1.0; kernel[5] = 1.0;
    kernel[6] = 1.0; kernel[7] = 1.0; kernel[8] = 1.0;
    
    kernel2[0] = 0.0; kernel2[1] = -1.0; kernel2[2] = 0.0;
    kernel2[3] = -5.0; kernel2[4] = -2.0; kernel2[5] = -5.0;
    kernel2[6] = 0.0; kernel2[7] = -1.0; kernel2[8] = 0.0;
    
    kernel3[0] = 1.0; kernel3[1] = 1.0; kernel3[2] = 1.0;
    kernel3[3] = 1.0; kernel3[4] = 1.0; kernel3[5] = 1.0;
    kernel3[6] = 1.0; kernel3[7] = 1.0; kernel3[8] = 1.0;
    
    vec4 sum = input0;
    vec4 sum2 = input0;
    vec4 sum3 = input0;
    int i;
    
    for (i = 0; i < 9; i++) {
        vec4 color = texture2DRect(src_tex_unit0, gl_TexCoord[0].st + offset[i]);
        sum += color * kernel[i];
        sum2 += color * kernel2[i];
        
        
    }
    sum = (sum+sum2+sum3)*0.333333;
    
    //sum = vec4(normalize(vec3(sum.r,sum.g,1.0/100.0)),1.0);
    //sum*=0.5;
    //sum+=0.5;
    
    
    gl_FragColor = sum + vec4(0.015,0.015,0.015,0.0) ;
    //gl_FragColor =  texture2DRect(src_tex_unit0, gl_TexCoord[0].st);
}