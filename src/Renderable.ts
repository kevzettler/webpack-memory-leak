import { mat4, glMatrix } from 'gl-matrix';
import { computed } from 'mobx';
import { ConstrainedMixin } from './types/ConstrainedMixin';
import Entity from './Entity';
import { IGeometry}  from './Geometry';
import { IAssetDependant } from './AssetDependency';
import { IAnimate } from './Animate';

glMatrix.setMatrixArrayType(Array);
export const defaultColorPalette = [[0,1,0,1],[0.9882352941176471,0.9882352941176471,0.9882352941176471,1],[0.9882352941176471,0.9882352941176471,0.8,1],[0.9882352941176471,0.9882352941176471,0.596078431372549,1],[0.9882352941176471,0.9882352941176471,0.39215686274509803,1],[0.9882352941176471,0.9882352941176471,0.18823529411764706,1],[0.9882352941176471,0.9882352941176471,0,1],[0.9882352941176471,0.8,0.9882352941176471,1],[0.9882352941176471,0.8,0.8,1],[0.9882352941176471,0.8,0.596078431372549,1],[0.9882352941176471,0.8,0.39215686274509803,1],[0.9882352941176471,0.8,0.18823529411764706,1],[0.9882352941176471,0.8,0,1],[0.9882352941176471,0.596078431372549,0.9882352941176471,1],[0.9882352941176471,0.596078431372549,0.8,1],[0.9882352941176471,0.596078431372549,0.596078431372549,1],[0.9882352941176471,0.596078431372549,0.39215686274509803,1],[0.9882352941176471,0.596078431372549,0.18823529411764706,1],[0.9882352941176471,0.596078431372549,0,1],[0.9882352941176471,0.39215686274509803,0.9882352941176471,1],[0.9882352941176471,0.39215686274509803,0.8,1],[0.9882352941176471,0.39215686274509803,0.596078431372549,1],[0.9882352941176471,0.39215686274509803,0.39215686274509803,1],[0.9882352941176471,0.39215686274509803,0.18823529411764706,1],[0.9882352941176471,0.39215686274509803,0,1],[0.9882352941176471,0.18823529411764706,0.9882352941176471,1],[0.9882352941176471,0.18823529411764706,0.8,1],[0.9882352941176471,0.18823529411764706,0.596078431372549,1],[0.9882352941176471,0.18823529411764706,0.39215686274509803,1],[0.9882352941176471,0.18823529411764706,0.18823529411764706,1],[0.9882352941176471,0.18823529411764706,0,1],[0.9882352941176471,0,0.9882352941176471,1],[0.9882352941176471,0,0.8,1],[0.9882352941176471,0,0.596078431372549,1],[0.9882352941176471,0,0.39215686274509803,1],[0.9882352941176471,0,0.18823529411764706,1],[0.9882352941176471,0,0,1],[0.8,0.9882352941176471,0.9882352941176471,1],[0.8,0.9882352941176471,0.8,1],[0.8,0.9882352941176471,0.596078431372549,1],[0.8,0.9882352941176471,0.39215686274509803,1],[0.8,0.9882352941176471,0.18823529411764706,1],[0.8,0.9882352941176471,0,1],[0.8,0.8,0.9882352941176471,1],[0.8,0.8,0.8,1],[0.8,0.8,0.596078431372549,1],[0.8,0.8,0.39215686274509803,1],[0.8,0.8,0.18823529411764706,1],[0.8,0.8,0,1],[0.8,0.596078431372549,0.9882352941176471,1],[0.8,0.596078431372549,0.8,1],[0.8,0.596078431372549,0.596078431372549,1],[0.8,0.596078431372549,0.39215686274509803,1],[0.8,0.596078431372549,0.18823529411764706,1],[0.8,0.596078431372549,0,1],[0.8,0.39215686274509803,0.9882352941176471,1],[0.8,0.39215686274509803,0.8,1],[0.8,0.39215686274509803,0.596078431372549,1],[0.8,0.39215686274509803,0.39215686274509803,1],[0.8,0.39215686274509803,0.18823529411764706,1],[0.8,0.39215686274509803,0,1],[0.8,0.18823529411764706,0.9882352941176471,1],[0.8,0.18823529411764706,0.8,1],[0.8,0.18823529411764706,0.596078431372549,1],[0.8,0.18823529411764706,0.39215686274509803,1],[0.8,0.18823529411764706,0.18823529411764706,1],[0.8,0.18823529411764706,0,1],[0.8,0,0.9882352941176471,1],[0.8,0,0.8,1],[0.8,0,0.596078431372549,1],[0.8,0,0.39215686274509803,1],[0.8,0,0.18823529411764706,1],[0.8,0,0,1],[0.596078431372549,0.9882352941176471,0.9882352941176471,1],[0.596078431372549,0.9882352941176471,0.8,1],[0.596078431372549,0.9882352941176471,0.596078431372549,1],[0.596078431372549,0.9882352941176471,0.39215686274509803,1],[0.596078431372549,0.9882352941176471,0.18823529411764706,1],[0.596078431372549,0.9882352941176471,0,1],[0.596078431372549,0.8,0.9882352941176471,1],[0.596078431372549,0.8,0.8,1],[0.596078431372549,0.8,0.596078431372549,1],[0.596078431372549,0.8,0.39215686274509803,1],[0.596078431372549,0.8,0.18823529411764706,1],[0.596078431372549,0.8,0,1],[0.596078431372549,0.596078431372549,0.9882352941176471,1],[0.596078431372549,0.596078431372549,0.8,1],[0.596078431372549,0.596078431372549,0.596078431372549,1],[0.596078431372549,0.596078431372549,0.39215686274509803,1],[0.596078431372549,0.596078431372549,0.18823529411764706,1],[0.596078431372549,0.596078431372549,0,1],[0.596078431372549,0.39215686274509803,0.9882352941176471,1],[0.596078431372549,0.39215686274509803,0.8,1],[0.596078431372549,0.39215686274509803,0.596078431372549,1],[0.596078431372549,0.39215686274509803,0.39215686274509803,1],[0.596078431372549,0.39215686274509803,0.18823529411764706,1],[0.596078431372549,0.39215686274509803,0,1],[0.596078431372549,0.18823529411764706,0.9882352941176471,1],[0.596078431372549,0.18823529411764706,0.8,1],[0.596078431372549,0.18823529411764706,0.596078431372549,1],[0.596078431372549,0.18823529411764706,0.39215686274509803,1],[0.596078431372549,0.18823529411764706,0.18823529411764706,1],[0.596078431372549,0.18823529411764706,0,1],[0.596078431372549,0,0.9882352941176471,1],[0.596078431372549,0,0.8,1],[0.596078431372549,0,0.596078431372549,1],[0.596078431372549,0,0.39215686274509803,1],[0.596078431372549,0,0.18823529411764706,1],[0.596078431372549,0,0,1],[0.39215686274509803,0.9882352941176471,0.9882352941176471,1],[0.39215686274509803,0.9882352941176471,0.8,1],[0.39215686274509803,0.9882352941176471,0.596078431372549,1],[0.39215686274509803,0.9882352941176471,0.39215686274509803,1],[0.39215686274509803,0.9882352941176471,0.18823529411764706,1],[0.39215686274509803,0.9882352941176471,0,1],[0.39215686274509803,0.8,0.9882352941176471,1],[0.39215686274509803,0.8,0.8,1],[0.39215686274509803,0.8,0.596078431372549,1],[0.39215686274509803,0.8,0.39215686274509803,1],[0.39215686274509803,0.8,0.18823529411764706,1],[0.39215686274509803,0.8,0,1],[0.39215686274509803,0.596078431372549,0.9882352941176471,1],[0.39215686274509803,0.596078431372549,0.8,1],[0.39215686274509803,0.596078431372549,0.596078431372549,1],[0.39215686274509803,0.596078431372549,0.39215686274509803,1],[0.39215686274509803,0.596078431372549,0.18823529411764706,1],[0.39215686274509803,0.596078431372549,0,1],[0.39215686274509803,0.39215686274509803,0.9882352941176471,1],[0.39215686274509803,0.39215686274509803,0.8,1],[0.39215686274509803,0.39215686274509803,0.596078431372549,1],[0.39215686274509803,0.39215686274509803,0.39215686274509803,1],[0.39215686274509803,0.39215686274509803,0.18823529411764706,1],[0.39215686274509803,0.39215686274509803,0,1],[0.39215686274509803,0.18823529411764706,0.9882352941176471,1],[0.39215686274509803,0.18823529411764706,0.8,1],[0.39215686274509803,0.18823529411764706,0.596078431372549,1],[0.39215686274509803,0.18823529411764706,0.39215686274509803,1],[0.39215686274509803,0.18823529411764706,0.18823529411764706,1],[0.39215686274509803,0.18823529411764706,0,1],[0.39215686274509803,0,0.9882352941176471,1],[0.39215686274509803,0,0.8,1],[0.39215686274509803,0,0.596078431372549,1],[0.39215686274509803,0,0.39215686274509803,1],[0.39215686274509803,0,0.18823529411764706,1],[0.39215686274509803,0,0,1],[0.18823529411764706,0.9882352941176471,0.9882352941176471,1],[0.18823529411764706,0.9882352941176471,0.8,1],[0.18823529411764706,0.9882352941176471,0.596078431372549,1],[0.18823529411764706,0.9882352941176471,0.39215686274509803,1],[0.18823529411764706,0.9882352941176471,0.18823529411764706,1],[0.18823529411764706,0.9882352941176471,0,1],[0.18823529411764706,0.8,0.9882352941176471,1],[0.18823529411764706,0.8,0.8,1],[0.18823529411764706,0.8,0.596078431372549,1],[0.18823529411764706,0.8,0.39215686274509803,1],[0.18823529411764706,0.8,0.18823529411764706,1],[0.18823529411764706,0.8,0,1],[0.18823529411764706,0.596078431372549,0.9882352941176471,1],[0.18823529411764706,0.596078431372549,0.8,1],[0.18823529411764706,0.596078431372549,0.596078431372549,1],[0.18823529411764706,0.596078431372549,0.39215686274509803,1],[0.18823529411764706,0.596078431372549,0.18823529411764706,1],[0.18823529411764706,0.596078431372549,0,1],[0.18823529411764706,0.39215686274509803,0.9882352941176471,1],[0.18823529411764706,0.39215686274509803,0.8,1],[0.18823529411764706,0.39215686274509803,0.596078431372549,1],[0.18823529411764706,0.39215686274509803,0.39215686274509803,1],[0.18823529411764706,0.39215686274509803,0.18823529411764706,1],[0.18823529411764706,0.39215686274509803,0,1],[0.18823529411764706,0.18823529411764706,0.9882352941176471,1],[0.18823529411764706,0.18823529411764706,0.8,1],[0.18823529411764706,0.18823529411764706,0.596078431372549,1],[0.18823529411764706,0.18823529411764706,0.39215686274509803,1],[0.18823529411764706,0.18823529411764706,0.18823529411764706,1],[0.18823529411764706,0.18823529411764706,0,1],[0.18823529411764706,0,0.9882352941176471,1],[0.18823529411764706,0,0.8,1],[0.18823529411764706,0,0.596078431372549,1],[0.18823529411764706,0,0.39215686274509803,1],[0.18823529411764706,0,0.18823529411764706,1],[0.18823529411764706,0,0,1],[0,0.9882352941176471,0.9882352941176471,1],[0,0.9882352941176471,0.8,1],[0,0.9882352941176471,0.596078431372549,1],[0,0.9882352941176471,0.39215686274509803,1],[0,0.9882352941176471,0.18823529411764706,1],[0,0.9882352941176471,0,1],[0,0.8,0.9882352941176471,1],[0,0.8,0.8,1],[0,0.8,0.596078431372549,1],[0,0.8,0.39215686274509803,1],[0,0.8,0.18823529411764706,1],[0,0.8,0,1],[0,0.596078431372549,0.9882352941176471,1],[0,0.596078431372549,0.8,1],[0,0.596078431372549,0.596078431372549,1],[0,0.596078431372549,0.39215686274509803,1],[0,0.596078431372549,0.18823529411764706,1],[0,0.596078431372549,0,1],[0,0.39215686274509803,0.9882352941176471,1],[0,0.39215686274509803,0.8,1],[0,0.39215686274509803,0.596078431372549,1],[0,0.39215686274509803,0.39215686274509803,1],[0,0.39215686274509803,0.18823529411764706,1],[0,0.39215686274509803,0,1],[0,0.18823529411764706,0.9882352941176471,1],[0,0.18823529411764706,0.8,1],[0,0.18823529411764706,0.596078431372549,1],[0,0.18823529411764706,0.39215686274509803,1],[0,0.18823529411764706,0.18823529411764706,1],[0,0.18823529411764706,0,1],[0,0,0.9882352941176471,1],[0,0,0.8,1],[0,0,0.596078431372549,1],[0,0,0.39215686274509803,1],[0,0,0.18823529411764706,1],[0.9254901960784314,0,0,1],[0.8627450980392157,0,0,1],[0.7215686274509804,0,0,1],[0.6588235294117647,0,0,1],[0.5333333333333333,0,0,1],[0.4549019607843137,0,0,1],[0.32941176470588235,0,0,1],[0.26666666666666666,0,0,1],[0.12549019607843137,0,0,1],[0.06274509803921569,0,0,1],[0,0.9254901960784314,0,1],[0,0.8627450980392157,0,1],[0,0.7215686274509804,0,1],[0,0.6588235294117647,0,1],[0,0.5333333333333333,0,1],[0,0.4549019607843137,0,1],[0,0.32941176470588235,0,1],[0,0.26666666666666666,0,1],[0,0.12549019607843137,0,1],[0,0.06274509803921569,0,1],[0,0,0.9254901960784314,1],[0,0,0.8627450980392157,1],[0,0,0.7215686274509804,1],[0,0,0.6588235294117647,1],[0,0,0.5333333333333333,1],[0,0,0.4549019607843137,1],[0,0,0.32941176470588235,1],[0,0,0.26666666666666666,1],[0,0,0.12549019607843137,1],[0,0,0.06274509803921569,1],[0.9254901960784314,0.9254901960784314,0.9254901960784314,1],[0.8627450980392157,0.8627450980392157,0.8627450980392157,1],[0.7215686274509804,0.7215686274509804,0.7215686274509804,1],[0.6588235294117647,0.6588235294117647,0.6588235294117647,1],[0.5333333333333333,0.5333333333333333,0.5333333333333333,1],[0.4549019607843137,0.4549019607843137,0.4549019607843137,1],[0.32941176470588235,0.32941176470588235,0.32941176470588235,1],[0.26666666666666666,0.26666666666666666,0.26666666666666666,1],[0.12549019607843137,0.12549019607843137,0.12549019607843137,1],[0.06274509803921569,0.06274509803921569,0.06274509803921569,1]];
const placeHolderJoints = [...new Array(22)].map(() => mat4.identity(mat4.create()));

export interface IPaletteStruct{
  r:number
  g:number
  b:number
  a:number
}

function paletteStructToArray(palette: IPaletteStruct[]){
  return palette.map(ps => [ps.r,ps.g,ps.b,ps.a]);
}

type RenderableConstraint = ConstrainedMixin<Entity &
                            IGeometry &
                            IAssetDependant &
                            IAnimate &
                            {
                              palette?: IPaletteStruct[]
                              skeleton?: any
                              networkSnaps?: any[]
                              replicatedModelMat?: mat4
                            }>;

export default function Renderable<TBase extends RenderableConstraint>(superclass: TBase) {
  class Renderable extends superclass{
    @computed({keepAlive: true}) get renderBuffer(){
      return this.rootStore.renderStore.regl.buffer({
        data: this.assetBuffer,
        usage: 'static',
        type: 'uint8',
      });
    }

    @computed({keepAlive: true})
    get colorBuffer(){
      const colorBuff = [];
      const palette = this.palette ?
                      paletteStructToArray(this.palette) :
                      defaultColorPalette;

      for(var i = 0; i< this.assetBuffer.length; i+=8){
        let paletteId = this.assetBuffer[i+7];
        // assume passed in palettes are QB models with the combined
        //joint+palette value need to extract true palette id
        if(this.palette){
          const float = paletteId / 10;
          const x = Math.floor(float);
          const y = Math.floor(Math.ceil(((float-x) * 100)) / 10);
          paletteId = y;
        }
        const colorVal = palette[paletteId];
        colorBuff.push(colorVal);
      }

      return this.rootStore.renderStore.regl.buffer({
        data: colorBuff,
        usage: 'static',
        type: 'float',
      });
    }

    @computed({keepAlive: true})
    get renderPayload(){
      const jointPaletteSplit = this.skeleton ? 10.0 : 1.0;
      const joints = this.skeleton ?
                     this.animJoints :
                     //empty joints if no skeleton
                     placeHolderJoints;

      const aomesh = this.renderBuffer;
      return {
        id: this.id,
        aomesh,
        count: aomesh._buffer.byteLength/8,
        joints,
        colors: this.colorBuffer,
        //Static meshes like MVox verts
        // use packedJointAndPalette for palette only.
        jointPaletteSplit,
        animationOriginOffset: this.animationOriginOffset
      };
    }

    @computed({keepAlive: true}) get replicaRenderNode(){
      if(this.networkSnaps){
        return {
          ...this.renderPayload,
          model: this.replicatedModelMat,
        }
      }

      if(this.parent && this.parent.networkSnaps){
        return {
          ...this.renderPayload,
          model: mat4.multiply(
            mat4.create(),
            this.localModel,
            this.parent.replicatedModelMat,
          )
        }
      }

      return null;
    }
  }

  return Renderable;
}
