import { computed } from 'mobx';
import { vec3, mat4 } from 'gl-matrix';
import {
  vertsFromAABB,
  AABBintersectAABB,
} from './util/collisions.js';
import boundingBox from 'vertices-bounding-box';

import { ConstrainedMixin } from './types/ConstrainedMixin';
import Entity from './Entity';
import { IGeometry}  from './Geometry';

type BroadPhaseBoxMixin = ConstrainedMixin<Entity & IGeometry>;

export interface IBroadPhaseBox{
  broadPhaseBoxPadding: vec3;
  localAABB: vec3[]
  getCenterPointFromPosition(position: vec3): vec3
  broadPhaseCollisions: unknown[]
}

export default function BroadPhaseBox<TBase extends BroadPhaseBoxMixin>(Base: TBase){
  class BroadPhaseBox extends Base implements IBroadPhaseBox {
    broadPhaseBoxPadding: vec3 = [0,0,0]

    constructor(...args: any[]){
      super(args[0]);
      const props = args[0];
      if(props.broadPhaseBoxPadding) this.broadPhaseBoxPadding = props.broadPhaseBoxPadding;
    }

    @computed({keepAlive: true})
    get localAABB(){
      let box = boundingBox(this.positions);
      if(this.broadPhaseBoxPadding){
        vec3.sub(box[0], box[0], this.broadPhaseBoxPadding);
        vec3.add(box[1], box[1], this.broadPhaseBoxPadding);
      }
      return box;
    }

    @computed({keepAlive: true})
    get localAABBVerts(){
      return vertsFromAABB(this.localAABB)
    }

    @computed({keepAlive: true})
    get worldAABBVerts(){
      return this.localAABBVerts.map((localAABBVert) => {
        return vec3.transformMat4(
          [0,0,0],
          localAABBVert,
          this.model
        );
      })
    }

    @computed({keepAlive: true})
    get worldAABB(){
      return boundingBox(<[number,number,number][]>this.worldAABBVerts);
    }

    @computed({keepAlive: true})
    get AABBScale(){
      const localAABB = this.localAABB;
      return Math.max(
        localAABB[1][0],
        localAABB[1][1],
        localAABB[1][2]
      );
    }

    getCenterPointFromPosition(position: vec3): vec3{
      return [
        position[0],
        position[1] + (this.localAABB[1][0] / 2),
        position[2],
      ];
    }

    @computed({keepAlive: true})
    get centerPoint(){
      return this.getCenterPointFromPosition(<vec3>this.position);
    }

    @computed get centerTop(){
      return [
        this.position[0],
        this.position[1] + this.localAABB[1][0],
        this.position[2],
      ];
    }

    get broadPhaseCollisions(){
      return Object
        .values(this.rootStore.entityStore.entityIndex)
        .filter((otherEntity: Entity & {worldAABB?: [vec3][]}) => {
          const notSelf = this.id !== otherEntity.id;
          const notSibling = this.rootParentId !== otherEntity.rootParentId;

          // notSelf and notSibling maybe shouldn't be considered here
          // maybe there are cases where you'd want to know when
          // sibling collide?
          return notSelf &&
                 notSibling &&
                 otherEntity.worldAABB &&
                 AABBintersectAABB(this.worldAABB, otherEntity.worldAABB)
        })
    }

    @computed({keepAlive: true})
    get aabbRenderPayload(){
      return {
        model: mat4.create(),
        positions: this.worldAABBVerts,
        cells: [
          [ 0, 1, 2 ],
          [ 0, 2, 3 ],
          [ 6, 5, 4 ],
          [ 6, 4, 7 ],
          [ 1, 7, 4 ],
          [ 1, 4, 2 ],
          [ 0, 3, 5 ],
          [ 0, 5, 6 ],
          [ 0, 6, 7 ],
          [ 0, 7, 1 ],
          [ 2, 4, 5 ],
          [ 2, 5, 3 ]
        ],
        color: this.broadPhaseCollisions.length ? [0, 0.7, 0.2, 0.5] : [0.7,0,0.5, 0.5],
      }
    }
  }

  return BroadPhaseBox;
}
