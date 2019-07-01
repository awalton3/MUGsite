export class User {
  constructor(
    public name: string,
    public photoUrl: string,
    public email: string,
    public type: string,
    public uid: string,
    public isNewUser: boolean, 
    public creationTime: number
  ) { }

}
