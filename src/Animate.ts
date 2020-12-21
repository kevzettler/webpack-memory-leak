import { mat4, vec2 } from 'gl-matrix';
import { computed } from 'mobx';
import convertDualQuatToMatrix from 'dual-quat-to-mat4';
import mechSniperActions from './assets/mechsniper-actions.js';
import AnimationController from './AnimationController';
import { ConstrainedMixin } from './types/ConstrainedMixin';

import Entity from './Entity';
import {IAssetDependant} from './AssetDependency';


interface AnimateProps {
  dashing?: boolean
}

export interface IAnimate{
  controllers: AnimationController[];
  animJoints: mat4[]
  skeleton: any
  animationOriginOffset: mat4
}

export type Animate = ConstrainedMixin<Entity & IAssetDependant>;

export default function Animate<TBase extends Animate>(superclass: TBase) {
  class Animate extends superclass implements IAnimate {
    skeleton = mechSniperActions
    dashing: boolean = false
    jointsPlaceholder: mat4[] = []
    jointSets: any[] = []
    controllers: AnimationController[]

    //FIXME where should this thing live?
    weapon: string = null

    constructor(...args: any[]){
      super(args[0]);

      this.jointsPlaceholder = [...Array(Object.keys(this.skeleton.jointNameIndices).length)]
        .map(() => mat4.identity([
          0,0,0,0,
          0,0,0,0,
          0,0,0,0,
          0,0,0,0
        ]));

      this.jointSets = [];
      const upperJoints = [
        'Chest',
        'Head',
        'ElbowL',
        'ElbowR',
        'ShoulderL',
        'ShoulderR',
        'BicepL',
        'BicepR',
        'ArmL',
        'ArmR',
        'HandL',
        'HandR',
      ];
      this.jointSets.push(upperJoints);

      const lowerJoints = [
        'Root',
        'Waist',
        'KneeL',
        'KneeR',
        'FootR',
        'FootL',
        'ShinL',
        'ShinR',
        'ThighR',
        'ThighL',
      ];
      this.jointSets.push(lowerJoints);

      this.controllers = this.jointSets.map(
        (jointSet: string[]) => new AnimationController(jointSet, this.skeleton)
      );


      // //Move the legs in the strafe direction
      // //May not need this infavor of a strafe animation
      // this.controllers[1].postHook = function (interpolatedJoints){
      //   if(this.moveAxisDirection && this.moveAxisDirection[1] !== 0){
      //     Object.keys(interpolatedJoints).forEach(function jointIterator(jointId){
      //       var newJoint = quat2.rotateY([],
      //                                    interpolatedJoints.joints[jointId],
      //                                    -this.moveAxisDirection[1] * (Math.PI/6))
      //       interpolatedJoints.joints[jointId] = newJoint;
      //     }.bind(this));
      //   }

      //   return interpolatedJoints;
      // }.bind(this);

      this.on('tick', (deltaTime: number) => {
        this.controllers.forEach((c: AnimationController) => c.animationTick(deltaTime));
      });

      this.on('jump', () => {
        this.controllers.forEach((c: AnimationController) => c.playAnimation({name: 'jump'}));
      });

      this.on('touchdown', () => {
        this.controllers.forEach((c: AnimationController) => c.playAnimation({name: 'walk'}));
      });

      this.on('startDash', () => {
        this.dashing = true;
        this.controllers.forEach((controller: AnimationController) => {
          controller.playAnimation({name: 'fdash'});
        });
      })

      this.on('stopDash', () => { this.dashing = false })

      this.on('movePress', () => {
        this.controllers.forEach((controller: AnimationController) => {
          if(this.dashing){
            controller.playAnimation({name: 'fdash'});
          }else{
            controller.playAnimation({name: 'aggro'});
          }
        });
      });

      this.on('moveRelease', () => {
        if(
          this.parent.moveAxisDirection[0] === 0 &&
          this.parent.moveAxisDirection[1] === 0
        ){
          this.controllers.forEach((controller: AnimationController) => controller.playAnimation({name: 'pose'}));
        }
      });

      this.on('primaryTrigger', () => {
        if(this.weapon && this.weapon === 'standardGun'){
          this.controllers[0].playAnimation({name: 'aggro', noLoop: true});
        }else{
          this.controllers.forEach((controller: AnimationController) => controller.playAnimation({name: 'slice', noLoop: true}));
        }
      });

      this.on('damage', () => {
        console.log("Playing DAMAGE ANIM");
        this.controllers.forEach((controller: AnimationController) => controller.playAnimation({name: 'damage', noLoop: true}));
      });
    }

    //TODO Need to calculate this with out the Sword in...
    @computed get animationOriginOffset(): mat4 {
      return mat4.fromTranslation(
        mat4.create(),
        [
          -Math.floor(this.assetAABB[1][0] / 2),
          0, //don't recenter on the Y axis
          -Math.floor(this.assetAABB[1][2] / 2)
        ]
      );
    }

    @computed({keepAlive: true})
    get animJoints(): mat4[]{
      const interpolatedJoints = Object.assign(
        {},
        this.controllers[0].interpolatedJoints.joints,
        this.controllers[1].interpolatedJoints.joints,
      );

      Object.keys(interpolatedJoints).forEach((i: string) => {
        this.jointsPlaceholder[parseInt(i)] = convertDualQuatToMatrix(this.jointsPlaceholder[parseInt(i)], interpolatedJoints[i]);
      });

      return this.jointsPlaceholder;
    }

  }

  return Animate;
}
