// https://stackoverflow.com/a/30097530/93212
// https://stackoverflow.com/questions/31119653/billboarding-vertices-in-the-vertex-shader/31121743#31121743
// https://stackoverflow.com/questions/41767490/how-to-transform-vertices-in-vertex-shader-to-get-a-3d-billboard

precision mediump float;

attribute vec3 position;
attribute vec2 uvs;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec2 uv;

void main() {
  uv = uvs;

  float scale = length(view[3].xyz);
  mat4 scaleMat = mat4(
                       vec4(scale,0.0,0.0,0.0),
                       vec4(0.0,scale,0.0,0.0),
                       vec4(0.0,0.0,1.0,0.0),
                       vec4(0.0,0.0,0.0,1.0)
                       );


  mat4 rot = mat4(
                  model[0],
                  model[1],
                  model[2],
                  vec4(0, 0, 0, 1)
                  );


  mat4 modelViewMat = view * model;
  vec4 billboardPos = modelViewMat * vec4(0.0, 0.0, 0.0, 1.0);

  gl_Position = projection * (billboardPos + (rot * vec4(position.x, position.y, 0.0, 0.0)));
}
