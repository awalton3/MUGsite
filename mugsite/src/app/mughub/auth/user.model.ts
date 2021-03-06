export class User {
  constructor(
    public name: string,
    public photoUrl: string,
    public email: string,
    public type: string,
    public uid: string,
    public isNewUser: boolean,
    public prefs: {
      MultiEmails: boolean, 
      AutoLog: boolean,
      InboxNotif: boolean,
      LogNotif: boolean
    },
    public connections: User[]
  ) { }
}
