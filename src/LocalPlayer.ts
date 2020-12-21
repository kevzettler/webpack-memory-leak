import { computed} from 'mobx';
import { vec4, vec3, vec2, quat } from 'gl-matrix';
import makeCube from 'primitive-cube';
import { v1 as uuidv1 }  from 'uuid';

import Entity from './Entity';
import BroadPhaseBox from './BroadPhaseBox';
import EllipsoidGeometry from './EllipsoidGeometry';
import Geometry from './Geometry';
import EllipsoidTriCollideBehavior from './EllipsoidTriCollide';
import PlayerInput from './PlayerInput'
import PlayerVelocity from './PlayerVelocity'
import CollisionHull from './CollisionHull'
import NetworkReplicated from './NetworkReplicated';
import Projectile from './Projectile'
import Animate from './Animate';
import AttackAnimation from './AttackAnimations';
import AssetDependent, { ItemMap } from './AssetDependency';
import Renderable, {IPaletteStruct} from './Renderable';



import { IEntityProps } from './Entity'
export interface IPlayerProps extends IEntityProps{
  weapon?: string
  gunRate?: [0,30]
  collider?: boolean
  eGeoRadius?: vec3
  assetFiles?: string[]
  palette?: IPaletteStruct[]
  items: ItemMap
}

const behaviorSet = [
  NetworkReplicated,
  PlayerVelocity,
  PlayerInput,
  EllipsoidTriCollideBehavior,
  BroadPhaseBox,
  CollisionHull,
  EllipsoidGeometry,
  Geometry
];

export default class LocalPlayer
extends Entity.behaves(...behaviorSet) {
  lookAxisDirection: vec2 = [0,0]   // x, y
  viewVertRotation: quat = [0,0,0,1]

  front: vec3 = [0,0,1]
  right: vec3 = [-1,0,0]
  up: vec3 = [0,1,0]

  engine: [number, number] = [100, 100]
  collider: true
  gunRate: [number, number] = [0, 30]
  broadPhaseBoxPadding: vec3 = [15, 9, 15]
  color: vec4 = [0,1,1,0.8]

  constructor(props: IPlayerProps){
    super(props)

    const playerMesh = new (Entity.behaves(
      Renderable,
      AttackAnimation,
      Animate,
      AssetDependent,
      Geometry
    ))({
      rootStore: this.rootStore,
      id: `player-quibicle-mesh-${props.id}`,
      assetFiles: props.assetFiles,
      palette: props.palette,
      weapon: props.weapon
    })
    // TODO why does AI Player crash here WTF?
    if(!playerMesh.boundingBox) debugger;

    this.geometryOffset = [
      0,
      0 + (playerMesh.boundingBox[1][0] / 2) + 5,
      0,
    ];

    this.eGeoRadius = [
      playerMesh.boundingBox[1][0] / 2 - 2,
      playerMesh.boundingBox[1][1] / 2 - 2,
      playerMesh.boundingBox[1][2] / 2 - 2,
    ];

    this.addChild(playerMesh);

    const playerAttackBox = new (Entity.behaves(BroadPhaseBox, Geometry))({
      rootStore: this.rootStore,
      id: `player-attack-box-${props.id}`,
      collider: true,
      ...makeCube(
        playerMesh.boundingBox[1][0],
        playerMesh.boundingBox[1][1] - 10,
        playerMesh.boundingBox[1][2] / 2,
      ),
      position: [
        0,
        playerMesh.boundingBox[1][1] / 2,
        20,
      ],
      color: [1,0,0,1],
    });
    playerMesh.addChild(playerAttackBox)

    this.on('tick', () => {
      if(
        this.engine[0] < this.engine[1] &&
        !this.dashing && !this.jetpackin ){
        this.engine[0] += (60 / 1000)
      }
    });

    //Create bullets if gun equiped
    if(props.weapon === 'standardGun'){
      this.on('tick', this.gunRateTickHandler);
    }
  }

  gunRateTickHandler(){
    if(this.trigger && this.gunRate[0] === 0){
      this.gunRate[0] += 1;
      const start = vec3.add(
        [0,0,0],
        this.position,
        [13, 25, 0]
      );

      const target = this.viewTargetVec;


      new (Entity.behaves(Projectile, Geometry))({
        rootStore: this.rootStore,
        id: `bullet-${uuidv1()}`,
        position: start,
        direction: vec3.normalize(
          [0,0,0],
          vec3.sub(
            [0,0,0],
            target,
            start,
          )),
        ...makeCube(10),
        color: [0.7,0.8,0,1]
      });

    }else if(this.trigger && this.gunRate[0] >= this.gunRate[1]){
      this.gunRate[0] = 0;
    }else{
      this.gunRate[0] += 1;
    }
  }

  @computed get cameraDistanceFromPlayer(): number{
    return 150 * this.scaleMultiplier
  }

  @computed get cameraHeightOffset(): vec3{
    return [
      0,
      50 * this.scaleMultiplier,
      0
    ]
  }

  @computed get viewTargetVec(): vec3{
    const cameraTargetHeightOffset: vec3 = [0,35,0];
    const targetProjectionDistance = 150;
    if(!this.targetVec) this.targetVec = [0,0,0];
    if(!this.scaleOut) this.scaleOut = [0,0,0];
    if(!this.cameraRotationQuat) this.cameraRotationQuat = [0,0,0,1];
    if(!this.cameraFrontVec) this.cameraFrontVec = [0,0,0];

    // Offset the target from the entities positon + some height
    vec3.add(
      this.targetVec,
      this.position,
      cameraTargetHeightOffset
    ); //offset hight of target

    // rotate the camera quat by the entities horizontal and vertical rotations
    quat.mul(
      this.cameraRotationQuat,
      this.rotation,
      this.viewVertRotation
    );

    // update the camera front vector to face the rotation of the camera in world space
    vec3.transformQuat(
      this.cameraFrontVec,

      [0,0,1], // world front vector Z forward
      this.cameraRotationQuat
    );

    // extrued the target from the camera's front direction
    vec3.scale(
      this.scaleOut,
      this.cameraFrontVec,
      targetProjectionDistance
    );

    // Add the extrueded vector to the target vector to move it infront of the character
    vec3.add(
      this.targetVec,
      this.targetVec,
      this.scaleOut
    );

    return this.targetVec;
  }
}
