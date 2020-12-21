import Entity from './Entity';
import StaticVoxelMesh from './StaticVoxelMesh';
import Geometry from './Geometry';
import Animate from './Animate';
import AssetDependent from './AssetDependency';
import Renderable from './Renderable';
import { getAssetListFromItems } from './AssetDependency';
import AIPlayer from './AIPlayer';
/* import CollisionHull from './CollisionHull';
 * import BroadPhaseBox from './BroadPhaseBox';
 * import makeCube from 'primitive-cube'; */

import RootStore from './RootStore';

export default async function(rootStore: RootStore){
  // Test Cube
  /* new (Entity.behaves(
   *   CollisionHull,
   *   BroadPhaseBox,
   *   Geometry))
   * ({
   *   id:"test-cube",
   *   ...makeCube(100),
   *   rootStore,
   *   position: [200,50,0],
   *   color: [1,1,0,1]
   * })

   * // Test Box
   * new (Entity.behaves(
   *   CollisionHull,
   *   BroadPhaseBox,
   *   Geometry
   * ))({
   *   id:"test-box",
   *   // TODO need to move this make cube  parameters into internal constructor
   *   // makeCube returns {cells: [[...], positions:[[...]..]]}
   *   // kiwi cannot serialze nested arrays and that is a lot to send over the network
   *   ...makeCube(100, 20, 100),
   *   rootStore,
   *   position: [-300,70,100],
   *   color: [0.4,1,0,1]
   * }) */

  const baddieItems = {
    head: 'geordiHead',
    core: 'standardCore',
    arms: 'standardArms',
    legs: 'standardLegs',
    booster: 'wingBooster',
    weapon: 'standardSword',
  }
  const baddieAssets = getAssetListFromItems(baddieItems);
  await rootStore.assetStore.fetchList(baddieAssets);

  new AIPlayer({
    rootStore,
    id: 'baddie-root',
    position: [100, 0, -100],
    rotation: [0, 0.9999735576321609, 0, 0.007272141118422239],
    assetFiles: baddieAssets,
    collider: true,
    broadPhaseBoxPadding: [15, 9, 15],
    color: [0,1,1,0.8],
    palette:  [
      {"r":1,"g":1,"b":0.403921568627451,"a":1},
      {"r":0,"g":0,"b":0,"a":1},
      {"r":0.4588235294117647,"g":0.4588235294117647,"b":0.27450980392156865,"a":1},
      {"r":0.9803921568627451,"g":0.9764705882352941,"b":0.4196078431372549,"a":1},
      {"r":0.7490196078431373,"g":0.09019607843137255,"b":0.6039215686274509,"a":1}
    ],
    items: baddieItems
  });


  await rootStore.assetStore.fetchList([
    'chr_fatkid.aoverts',
    'obj_house1a.aoverts',
    'obj_house4.aoverts',
    'tree1.aoverts',
    'ramp.aoverts',
  ]);

  new StaticVoxelMesh({
    id: 'tree',
    position: [50,0,0],
    assetFiles: ['tree1.aoverts'],
    rootStore
  });


  new StaticVoxelMesh({
    id: 'ramp',
    position: [-200,0,0],
    assetFiles: ['ramp.aoverts'],
    rootStore,
    //      alignMeshToCenterOrigin: true,
  });

  new StaticVoxelMesh({
    id: 'fat-kid-mesh',
    position: [-50,0, 100],
    assetFiles:['chr_fatkid.aoverts'],
    rootStore
  });

  new StaticVoxelMesh({
    id:"house",
    position: [100,0,200],
    assetFiles: ['obj_house1a.aoverts'],
    rootStore
  })

  new StaticVoxelMesh({
    id: 'house2',
    position: [-100,0,200],
    assetFiles: ['obj_house4.aoverts'],
    rootStore
  })
}
