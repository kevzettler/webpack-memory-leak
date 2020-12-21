import { vec3 } from 'gl-matrix';
import { autorun, computed} from 'mobx';
import itemIndex from './items';
import boundingBox from 'vertices-bounding-box';
import { ConstrainedMixin } from './types/ConstrainedMixin';

import { IGeometry } from './Geometry';

import Entity from './Entity';

export function getAssetListFromItems(items: ItemMap){
  return Object.values(items).flatMap(
    (itemId: string) => (itemIndex as any)[itemId].assets)
}

export interface ItemMap {
  head: string
  core: string
  arms: string
  legs: string
  booster: string
  weapon: string
}

export interface EntityDef {
  assetFiles?: string[];
  items?: ItemMap
}

export function getEntityAssetFiles(entityDef: EntityDef){
  if(entityDef.assetFiles && entityDef.assetFiles.length){
    return entityDef.assetFiles;
  }else if(entityDef.items){
    return getAssetListFromItems(entityDef.items);
  }
}

type AssetDependentMixin = ConstrainedMixin<Entity & IGeometry>;

export interface IAssetDependant{
  assetFiles: string[];
  assetAABB: [vec3,vec3]
  assetBuffer: Buffer
}


export default function AssetDependent<TBase extends AssetDependentMixin>(superclass: TBase){
  class AssetDependent extends superclass implements IAssetDependant {
    assetFiles: string[] = []

    constructor(...args: any[]){
      super(args[0]);
      const props = args[0];
      if(props.assetFiles) this.assetFiles = props.assetFiles;

      // Override the simplical complex
      // geometry with assetBuffer geometry
      const tris: vec3[][] = [[]];
      const originAssetVerts: vec3[] = [];

      for(var i = 0; i< this.assetBuffer.length; i+=8){
        originAssetVerts.push([
          this.assetBuffer[i],
          this.assetBuffer[i+1],
          this.assetBuffer[i+2]
        ]);

        let lastTri: vec3[] = tris[tris.length-1];
        if(lastTri.length === 3) {
          tris.push([]);
          lastTri = tris[tris.length-1];
        }

        lastTri.push([
          this.assetBuffer[i],
          this.assetBuffer[i+1],
          this.assetBuffer[i+2]
        ]);
      }
      this.positions = originAssetVerts
      this.tris = tris;
    }

    @computed({keepAlive: true})
    get assetAABB(){
      return boundingBox(this.positions);
    }

    @computed get assetIds(): string[]{
      return getEntityAssetFiles(this)
    }

    get areAssetsLoaded(): boolean{
      this.assetIds.forEach((assetId) => {
        if(!this.rootStore.assetStore.loadedAssets[assetId]){
          return false;
        }
      });

      return true;
    }

    @computed({keepAlive: true}) get assetBuffer(): Buffer{
      const loadedAssets = this.assetIds.map((aid: string) => this.rootStore.assetStore.loadedAssets[aid]);
      if(!loadedAssets || !loadedAssets.length){
        throw new Error(`expected loaded assets for ${this.id} found none`);
      }

      return Buffer.concat(loadedAssets);
    }

  }

  return AssetDependent;
}
