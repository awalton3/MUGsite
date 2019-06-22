import * as firebase from 'firebase';
import { Injectable } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class AuthService {

  private tempUser: User;
  tempUserCreated = new Subject<User>();

  constructor(private userService: UserService) { }

  register(formData: { email: string; password: string; name: any; type: string; }) {
    firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password)
      .then(userObj => {

        //save user data that is not on firebase userObj
        this.tempUser = {
          name: formData.name,
          photoUrl: null,
          email: userObj.user.email,
          type: formData.type,
          uid: userObj.user.uid
        };
        this.tempUserCreated.next(this.tempUser);

        //prompt user to verify email
        this.verifyEmail();

      })
      .catch(error => { alert(error.message) })
  }

  login(formData: { email: string; password: string; }) {
    firebase.auth().signInWithEmailAndPassword(formData.email, formData.password)
      .then(userObj => {
        if (userObj.user.emailVerified) {

          //update user service
          this.userService.createLocalUser(userObj.user.uid);

          //update local storage
          this.userService.user.subscribe(user => {
            localStorage.setItem('user', JSON.stringify(user))
          })

          //update firebase users collection if first time user
          if (this.ifNewUser(userObj.user.metadata))
            this.userService.addUserToFbCollect(this.tempUser.name, this.tempUser.photoUrl, this.tempUser.email, this.tempUser.type, this.tempUser.uid);

        }
        else
          alert("Please verify your email before loggin in.");
      })
      .catch(error => { alert(error.message) })
  }

  verifyEmail() {
    firebase.auth().currentUser.sendEmailVerification()
      .then(() => { alert("An email verification has been sent. Please verify your email before logging in.") })
      .catch(() => { alert("An error occured when sending an email verification to your email. Please try again.") });
  }

  resetPassword(email: string) {
    firebase.auth().sendPasswordResetEmail(email).then(() => {
      alert("A password reset email was sent.");
    }).catch(error => {
      alert(error.message);
    });
  }

  ifNewUser(metadata: firebase.auth.UserMetadata) {
    return metadata.creationTime === metadata.lastSignInTime;
  }

  autoLogin() {
    let user = JSON.parse(localStorage.getItem('user'));
    if(!user) return;
    this.userService.createLocalUser(user.uid);
  }
}
