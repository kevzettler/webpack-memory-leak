import {observable, computed, action} from 'mobx';
import isUUID from 'is-uuid';
import Projectile from './Projectile'
import Entity from './Entity';
import EllipsoidGeometry from './EllipsoidGeometry';
import EllipsoidTriCollideBehavior from './EllipsoidTriCollide';
import PlayerVelocity from './PlayerVelocity'
import CollisionHull from './CollisionHull'
import Geometry from './Geometry';
import Animate from './Animate';
import AssetDependent from './AssetDependency';
import Renderable from './Renderable';
import BroadPhaseBox from './BroadPhaseBox';
import StaticVoxelMesh from './StaticVoxelMesh';
import AIPlayer from './AIPlayer';
import RootStore from './RootStore'
import ClientStore from './ClientStore'

import LocalPlayer from './LocalPlayer';

const ENTITY_TYPES: {[index: string]: any} = {
  StaticVoxelMesh,
  AIPlayer,
};

const BEHAVIORS: {[index: string]: Function} = {
  Animate,
  AssetDependent,
  BroadPhaseBox,
  CollisionHull,
  EllipsoidGeometry,
  EllipsoidTriCollideBehavior,
  Geometry,
  Renderable,
  Projectile,
  PlayerVelocity,
};


interface IEntityIndex{
  [index: string]: any
  // TODO how to type the entity index?
  // It could return any permuation of entities and behaviorrs
}

export const entityReplacer = (key:string, value: any) => {
  if(key === 'rootStore') return undefined;
  if(key === 'localSnaps') return undefined;
  return value;
}

export default class EntityStore {
  rootStore
  entityRenderPayload: any[] = []
  lastTick = {};
  @observable entityIndex: IEntityIndex = {}

  constructor(rootStore: RootStore | ClientStore){
    this.rootStore = rootStore;
    /* autorun(() => {
     *   this.entityRenderPayload = this.renderPayload;
     * }); */
  }

  @action async addEntity(entity: Entity){
    if(entity.id && this.entityIndex[entity.id]){
      throw new Error(`Failed to add ${entity.id} an entity with that id already exists`);
    }

    this.entityIndex[entity.id] = entity;
    return entity;
  }

  @computed get entityAssetIds(){
    return Object.values(this.entityIndex).flatMap(e => e.assetIds);
  }

  get localPlayer(): LocalPlayer{
    return this.entityIndex[this.rootStore.uuid];
  }

  @computed({keepAlive: true}) get entityRefList(){
    return Object.values(this.entityIndex);
  }

  @action
  updateEntities(
    dt:number,
    elapsed:number,
    tickCount:number
  ){
    this.lastTick = {dt, elapsed, tickCount};
    this.entityRefList.forEach(function iterateEntities (entity: Entity){
      return entity.emit('tick', dt, elapsed, tickCount);
    });
  }

  @action removeEntity(entityId: string){
    const entityRef = this.entityIndex[entityId]
    if(!entityRef) return console.warn(`removeEntity ${entityId} does not exist`);

    if(entityRef.childIds.length){
      entityRef.childIds.forEach((childId: string) => this.removeEntity(childId));
    }

    this.entityIndex[entityId] = null;
    delete this.entityIndex[entityId];
  }

  @computed({keepAlive: true})
  get playerRoots(){
    return Object.values(this.entityIndex).filter((entity) => {
      return isUUID.v1(entity.id);
    })
  }

  @computed({keepAlive: true})
  get networkReplicatedEntities(){
    return Object.entries(this.entityIndex).reduce((
      acc: {[index: string]: any},
      [entityId, entity],
    ) => {
      if(entity.networkSnaps){
        acc[entityId] = entity;
      }
      return acc;
    }, {});
  }

  @action async processServerEntities(time: number, serverEntities: IEntityIndex){
    Object.values(serverEntities).forEach((entity) => this.serverEntityUpdate(time, entity))
  }

  @action async serverEntityUpdate(time:number, entity: Entity){
    if(!this.entityIndex[entity.id]){
      // if the entity has an explict type use that as a constructor
      if(entity.type && ENTITY_TYPES[entity.type]){
        console.log(`new ${entity.type}`, entity.id);

        new ENTITY_TYPES[entity.type]({
          ...entity,
          rootStore: this.rootStore
        });

        // If the entity is generic with a set of behaviors reconstruct those behaviors
      }else if(entity.behaviors){
        console.log("new behaviors", entity.id,  entity.behaviors);
        new (Entity.behaves(...entity.behaviors.map(b => BEHAVIORS[b.toString()])))({
          ...entity,
          rootStore: this.rootStore
        });
      }else{
        console.error(`unknown entity behavior ${entity.type}  ${entity.behaviors}`);
      }
    }else{
      if(!this.entityIndex[entity.id].networkSnap){
        console.error('failed to network snap', entity.id);
        return;
      }
      this.entityIndex[entity.id].networkSnap({
        time,
        entity
      });
    }
  }
}
