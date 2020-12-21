import { vec3, vec2 } from 'gl-matrix';
import { ConstrainedMixin } from './types/ConstrainedMixin';
import Entity from './Entity';

type ProjectileMixin = ConstrainedMixin<Entity>

export default function Projectile<TBase extends ProjectileMixin>(superclass: TBase) {
  return class Projectile extends(superclass){
    direction: vec3 = [0,0,0]
    hitPoints: vec2 = [0, 30*3]
    moveSpeed = 4
    decay = 1

    constructor(...args: any[]){
      super(args[1]);
      this.on('tick', () => {
        this.position = vec3.add(
          this.position,
          this.position,
          vec3.scale(
            [0,0,0],
            this.direction,
            this.moveSpeed
          )
        )
        this.hitPoints[0] -= this.decay
        //kill self LOL
        if(this.hitPoints[0] >= this.hitPoints[1]){
          this.rootStore.entityStore.entityIndex[this.id] = null;
        }
      });
    }
  }
}
