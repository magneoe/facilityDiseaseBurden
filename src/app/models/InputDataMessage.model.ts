

import {InputDataContent} from "../enums/InputDataContent.enum";

export class InputDataMessage {

  constructor(private broadCastGroup:string,
              private dataContent:InputDataContent,
              private payLoad:any,
              private reciever:number){
  }

  public getBroadCaseGroup():string {
    return this.broadCastGroup;
  }
  public getDataContent():InputDataContent {
    return this.dataContent;
  }
  public getPayload(): any {
    return this.payLoad;
  }
  public getReciever():number {
    return this.reciever;
  }
}

