import LocalPlayer, { IPlayerProps } from './LocalPlayer';

export default class AIPlayer
extends LocalPlayer {
  constructor(props: IPlayerProps){
    super(props);

    // really dumb AI for the baddie
    this.moveAxisDirection = [1,1];
    this.emit('movePress');

    this.on('tick', () => {
      if(this.position[2] >= 200){
        this.moveAxisDirection[0] = 1;
      }

      if(this.position[2] <= -200){
        this.moveAxisDirection[0] = -1;
      }

      if(this.position[0] >= 450){
        this.moveAxisDirection[1] = -1;
      }

      if(this.position[0] <= -450){
        this.moveAxisDirection[1] = 1;
      }
    });
  }
}
