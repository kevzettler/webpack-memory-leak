import regl from './reglDefer';
import flatVert from './shaders/flat.vert';
import flatFrag from './shaders/flat.frag';

export default regl({
  vert: flatVert,
  frag: flatFrag,
  elements: regl.prop('cells'),
  attributes: {
    position: regl.prop('positions'),
  },
  uniforms: {
    color: regl.prop('color'),
    model: regl.prop('model')
  }
});
