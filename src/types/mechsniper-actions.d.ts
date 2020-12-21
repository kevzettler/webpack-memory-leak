declare module 'mechsniper-actions' {

  export interface Bone {
    Matrix: number[];
  }

  export interface Aggro {
    bones: Bone[];
    frame_time_secs: number;
  }

  export interface Bone2 {
    Matrix: number[];
  }

  export interface Damage {
    bones: Bone2[];
    frame_time_secs: number;
  }

  export interface Bone3 {
    Matrix: number[];
  }

  export interface Death {
    bones: Bone3[];
    frame_time_secs: number;
  }

  export interface Bone4 {
    Matrix: number[];
  }

  export interface Fdash {
    bones: Bone4[];
    frame_time_secs: number;
  }

  export interface Bone5 {
    Matrix: number[];
  }

  export interface Jump {
    bones: Bone5[];
    frame_time_secs: number;
  }

  export interface Bone6 {
    Matrix: number[];
  }

  export interface Pose {
    bones: Bone6[];
    frame_time_secs: number;
  }

  export interface Bone7 {
    Matrix: number[];
  }

  export interface Punch {
    bones: Bone7[];
    frame_time_secs: number;
  }

  export interface Bone8 {
    Matrix: number[];
  }

  export interface Slouse {
    bones: Bone8[];
    frame_time_secs: number;
  }

  export interface Bone9 {
    Matrix: number[];
  }

  export interface Walk {
    bones: Bone9[];
    frame_time_secs: number;
  }

  export interface Actions {
    aggro: Aggro[];
    damage: Damage[];
    death: Death[];
    fdash: Fdash[];
    jump: Jump[];
    pose: Pose[];
    punch: Punch[];
    slice: Slouse[];
    walk: Walk[];
  }

  export interface InverseBindPos {
    Matrix: number[];
  }

  export interface JointIndex {
    Root: number;
    KneeL: number;
    ElbowL: number;
    FootL: number;
    KneeR: number;
    ElbowR: number;
    FootR: number;
    Waist: number;
    Chest: number;
    Head: number;
    ShoulderL: number;
    BicepL: number;
    ArmL: number;
    HandL: number;
    ShoulderR: number;
    BicepR: number;
    ArmR: number;
    HandR: number;
    ThighL: number;
    ShinL: number;
    ThighR: number;
    ShinR: number;
  }

  export interface RootObject {
    actions: Actions;
    inverseBindPoses: InverseBindPos[];
    jointNameIndices: JointIndex;
  }
}
