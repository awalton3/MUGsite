import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/mughub/auth/user.service';
import { StepperService } from 'src/app/shared/stepper/stepper.service';
import { MatDrawer } from '@angular/material/sidenav';
import { SnackBarService } from 'src/app/shared/snack-bar/snack-bar.service';

@Component({
  selector: 'mughub-welcome-setup-profile',
  templateUrl: './welcome-setup-profile.component.html',
  styleUrls: ['./welcome-setup-profile.component.css']
})

export class WelcomeSetupProfileComponent implements OnInit {

  @ViewChild('profileImageEditor', { static: false }) profileImageEditor: MatDrawer;
  currProfileImage: { isDataUrl: boolean, url: string };
  prevProfileImageUrl: string;
  isUploading: boolean = false;
  submitted: boolean = false;

  constructor(
    private userService: UserService,
    private stepperService: StepperService,
    private router: Router,
    private snackBarService: SnackBarService
  ) { }

  ngOnInit() {
    this.prevProfileImageUrl = this.userService.getUserSession().photoUrl;
    this.currProfileImage = {
      isDataUrl: false,
      url: this.userService.getUserSession().photoUrl
    };
  }

  requestNameFormValue() {
    this.submitted = true; //triggers edit-user-profile comp to send value
  }

  onProfileSubmit(event: string) {
    this.isUploading = true;
    const newUsername = event;
    if (this.profileHasChanged(newUsername)) {
      if (this.isValidUsername(newUsername)) {
        this.userService.updateLocalUser([{ name: 'name', value: newUsername }]);
        this.handleProfileImage();
      } else {
        this.onError("Your username cannot be blank.");
      }
    } else {
      this.onError('There are no changes to update.');
    }
  }

  isValidUsername(newUsername: string) {
    return (newUsername !== '')
  }

  profileHasChanged(newUsername: string): boolean {
    const usernameChanged = (newUsername !== this.userService.getUserSession().photoUrl.name);
    const profileImageChanged = (this.currProfileImage.url !== this.prevProfileImageUrl);
    return usernameChanged || profileImageChanged;
  }

  handleProfileImage() {
    if (this.currProfileImage.isDataUrl) {
      this.userService.uploadProfileImage(this.currProfileImage.url)
        .then(imageUrl => {
          this.userService.updateLocalUser([{ name: 'photoUrl', value: imageUrl }]);
          this.onSuccess();
        })
        .catch(error => {
          console.log(error);
          this.onError("Error in uploading your profile image.");
        })
    } else {
      this.userService.updateLocalUser([{ name: 'photoUrl', value: this.currProfileImage.url }]);
      this.onSuccess();
    }
  }

  onError(message: string) {
    this.isUploading = false;
    this.submitted = false;
    this.snackBarService.onOpenSnackBar.next({ message: message, isError: true });
  }

  onSuccess() {
    this.isUploading = false;
    this.submitted = false;
    this.userService.updateFbCollect();
    this.stepperService.onChangeStep.next({ name: 'settings', num: 1 });
    this.router.navigate(["mughub/welcome/account-setup/settings"])
  }

  loadImages() {
    this.router.navigate(['mughub/welcome/account-setup/profile/image']);
  }

  onFinishEditProfileImage(event: { isDataUrl: boolean, url: string }) {
    this.prevProfileImageUrl = this.currProfileImage.url;
    this.currProfileImage.url = event.url;
    this.currProfileImage.isDataUrl = event.isDataUrl;
    this.profileImageEditor.close();
  }

}
