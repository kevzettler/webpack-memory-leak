import { observable, autorun } from 'mobx';
import { vec3 } from 'gl-matrix';
import createEllipsoid from 'primitive-ellipsoid';

import { ConstrainedMixin } from './types/ConstrainedMixin';
import Entity from './Entity';
import { IGeometry}  from './Geometry';

type GeometryConstraint = ConstrainedMixin<Entity & IGeometry>;

export interface IEllipsoidGeometry{
  eGeoRadius: vec3
  geometryOffset: vec3
}

export default function EllipsoidGeometry<TBase extends GeometryConstraint>(superclass: TBase) {
  class EllipsoidGeometry extends superclass implements IEllipsoidGeometry {
    latSegments = 6
    lngSegments = 6
    @observable eGeoRadius: vec3 = [1,1,1]
    @observable geometryOffset: vec3 = [0,0,0]

    constructor(...args: any[]){
      super(args[0]);

      autorun(() => {
        const geometry = createEllipsoid(1, {
          latSegments: this.latSegments,
          lngSegments: this.lngSegments,
          rx: this.eGeoRadius[0],
          ry: this.eGeoRadius[1],
          rz: this.eGeoRadius[2],
        });

        geometry.positions.map(p => {
          return vec3.add(p,p,this.geometryOffset);
        });

        Object.assign(this, geometry);
      })

    }
  }

  return EllipsoidGeometry
}
