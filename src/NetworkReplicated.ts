import { vec3, mat4, quat } from 'gl-matrix';
import { observable, computed, action } from 'mobx';
import { ConstrainedMixin } from './types/ConstrainedMixin';


import Entity from './Entity';
import PlayerInput, { IMove } from './PlayerInput';
import PlayerVelocity from './PlayerVelocity'

type NetworkReplicatedMixin = ConstrainedMixin<Entity & IMove>;

interface ITime {
  elapsed: number, tickCount: number, curTime: number
}

interface INetworkSnap {
  time: ITime,
  entity: Entity
}

interface IinputPayload{
  type: string;
  arguments: any;
  time: ITime;
}

export default function NetworkReplicated<TBase extends NetworkReplicatedMixin>(superclass: TBase){
  class NetworkReplicated extends superclass {
    @observable networkSnaps: INetworkSnap[] = []
    maxNetworkSnaps = 5

    @observable localInputs: IinputPayload[] = []

    // event gets added dynamically by the EventeEmitter baseclass
    event = ''

    lerpEndPosition: vec3 = vec3.create()
    lerpEndRotation: quat = quat.create()

    constructor(...args: any[]){
      super(args[0]);

      // important
      //Don't do anything for this behavior on the server
      //localSnap is expensive
      if(this.rootStore.role !== 'client') return;


      this.on('jump', this.captureInput);
      this.on('releaseJump', this.captureInput);
      this.on('movePress', this.captureInput);
      this.on('movePress', this.captureInput);
      this.on('moveRelease', this.captureInput);
      this.on('moveRelease', this.captureInput);
      this.on('startDash', this.captureInput)
      this.on('stopDash', this.captureInput);
      this.on('primaryTrigger', this.captureInput)
      this.on('primaryRelease', this.captureInput)
      this.on('lookMove', this.captureInput)
    }

    @action captureInput(){
      if(arguments[arguments.length-1] === 'replay') return;

      this.localInputs.push({
        type: this.event,
        arguments,
        time: {
          elapsed: this.rootStore.loop._elapsed,
          tickCount: this.rootStore.loop._tickCount,
          curTime: this.rootStore.loop._curTime,
        }
      })
    }

    haveStatesDiverged(
      remoteState: INetworkSnap
    ){
      const pdiv = vec3.distance(
        this.position,
        remoteState.entity.position
      );

      return pdiv >  6;
    }

    @computed({keepAlive: true})
    get latestNetworkSnap(){
      return this.networkSnaps[this.networkSnaps.length-1];
    }

    @action networkSnap(networkSnap: INetworkSnap){
      this.networkSnaps[0] = networkSnap;

      // discard any local snaps that occur
      // before the latest network snap
      while(
        this.localInputs.length &&
        this.localInputs[0].time.curTime < networkSnap.time.curTime
      ){
        this.localInputs.shift();
      }

      if(
        this.haveStatesDiverged(this.networkSnaps[0])
      ){
        console.log('Rollback ', this.id);
        // copy the current position and rotation
        const startPosition = vec3.copy(vec3.create(), this.position);
        const startRotation = quat.copy(quat.create(), this.rotation);

        // reset to the remote state
        vec3.set(
          this.position,
          this.networkSnaps[0].entity.position[0],
          this.networkSnaps[0].entity.position[1],
          this.networkSnaps[0].entity.position[2],
        );

        quat.set(
          this.rotation,
          this.networkSnaps[0].entity.rotation[0],
          this.networkSnaps[0].entity.rotation[1],
          this.networkSnaps[0].entity.rotation[2],
          this.networkSnaps[0].entity.rotation[3],
        );

        // replay local inputs to bring entity up to date
        while(this.localInputs.length){
          const replayTicks = this.networkSnaps[0].time.tickCount - this.localInputs[0].time.tickCount;
          //replay ticks between event

          for(var i=0; i>replayTicks; i++){
            this.emit(
              'tick',
              this.rootStore.loop._fixedDeltaTime,
              this.rootStore.loop._elapsed,
              this.networkSnaps[0].time.tickCount + i
            );
          }

          // replay event
          // this causes an infinite loop because the captureInput
          // event will also capture these so we append replay to the end of arguments
          const extended = [...this.localInputs[0].arguments, 'replay'];
          this.emit(this.localInputs[0].type, ...extended);

          //move to next event
          this.localInputs.shift();
        }

        vec3.copy(this.lerpEndPosition, this.position);
        quat.copy(this.lerpEndRotation, this.rotation);

        // from kiri
        // alpha is just a step between 0 and 1. that will blend A - B by that step.
        // You pick a fixed step of 0.5 and recurseivly update
        //alpha = time you want to generate middle time / actual time difference
        // 0 - 10   middle is 5 would be 5 / 10


        // continuiously lerp by an alpha that is in between the two states until it eventually mathches
        vec3.lerp(this.position, startPosition, this.position, 0.5);

        // Kiri says this might have to be spherical lerp (sqlerp) instead of linear
        quat.lerp(this.rotation, startRotation, this.rotation, 0.5);
      }
    }

    @computed({keepAlive: true})
    get replicatedModelMat(){
      if(
        typeof this.latestNetworkSnap === 'undefined' ||
        !this.networkSnaps.length){
        return mat4.identity([
          0,0,0,0,
          0,0,0,0,
          0,0,0,0,
          0,0,0,0
        ]);
      }

      return mat4.fromRotationTranslationScale(
        [
          0,0,0,0,
          0,0,0,0,
          0,0,0,0,
          0,0,0,0
        ],
        this.latestNetworkSnap.entity.rotation,
        this.latestNetworkSnap.entity.position,
        this.scale
      );
    }
  }

  return NetworkReplicated;
}
