import { Component, OnInit, Output, OnDestroy, HostListener } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { UserService } from 'src/app/mughub/auth/user.service';
import { User } from 'src/app/mughub/auth/user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConnectionFormService } from '../../connection-form/connection-form.service';
import { MailService } from '../mail.service';
import { first } from 'rxjs/operators';
import { UploadService } from '../upload/upload.service';
import { Attachment } from '../../attachments/attachment.model';
import { AttachmentService } from '../../attachments/attachments.service';
import { Upload } from '../upload/upload.model';

@Component({
  selector: 'mughub-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})

export class UploaderComponent implements OnInit, OnDestroy {

  private subs = new Subscription();
  user: User;
  uploadForm: FormGroup = new FormGroup({});
  connectionsValid: boolean = false;
  possibleConnections: User[] = [];
  selectedConnections: string[] = [];
  selectedConnectionsOrig: string[] = [];
  attachments: Attachment[] = [];
  attachmentsToRemove: Attachment[] = [];
  compressedAttachment: string = '';
  removable = true;
  selectable = true;
  requiredConnections = true;
  chipCharLimit: number;
  isEditMode: boolean = false;
  uploadToEdit: Upload;
  @Output() onClose = new Subject();

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.getChipCharLimit();
  }

  constructor(
    private userService: UserService,
    private connectionsFormService: ConnectionFormService,
    private mailService: MailService,
    private uploadService: UploadService,
    private attachmentService: AttachmentService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getChipCharLimit();
    this.user = this.userService.getUserSession();
    this.getPossibleConnections();
    this.listenToConnectionsValid();
    this.listenToSelectedConnections();
    this.listenForUploadToEdit();
  }

  initForm() {
    this.uploadForm = new FormGroup({
      'subject': new FormControl(null, [Validators.required, Validators.maxLength(80)]),
      'body': new FormControl(null, [Validators.required])
    })
  }

  listenToSelectedConnections() {
    this.subs.add(this.connectionsFormService.onConnectionsChanged.subscribe(connectionsObj => {
      this.selectedConnections = connectionsObj.selectedConnections;
      this.selectedConnectionsOrig = connectionsObj.selectedConnectionsOrig;
    }));
  }

  listenToConnectionsValid() {
    this.subs.add(this.connectionsFormService.isformValid.subscribe(isFormValid => {
      this.connectionsValid = isFormValid;
    }));
  }

  listenForUploadToEdit() {
    this.subs.add(this.uploadService.uploadToEdit.subscribe(uploadToEdit => {
      this.isEditMode = true;
      this.uploadToEdit = uploadToEdit;
      this.connectionsFormService.onInitForEdit.next(uploadToEdit.recipients);
      this.uploadForm.controls.subject.setValue(uploadToEdit.subject);
      this.uploadForm.controls.body.setValue(uploadToEdit.body)
      this.attachments = uploadToEdit.attachments.map(attachment => new Attachment(attachment.displayName, attachment.storageRef, null));
    }))
  }

  getPossibleConnections() {
    this.userService.getUserSession().connections.forEach(connectionId => {
      this.userService.getUserFromFbCollect(connectionId)
        .pipe(first())
        .subscribe(userObj => {
          this.possibleConnections.push(new User(
            userObj.data().name,
            userObj.data().photoUrl,
            userObj.data().email,
            userObj.data().type,
            userObj.data().uid,
            userObj.data().isNewUser,
            userObj.data().prefs,
            userObj.data().connections))
        })
    })
  }

  getChipCharLimit() {
    if (window.innerWidth > 500) {
      this.chipCharLimit = 40;
    }
    else if (window.innerWidth > 460) {
      this.chipCharLimit = 34;
    }
    else if (window.innerWidth > 410) {
      this.chipCharLimit = 28;
    }
    else if (window.innerWidth > 360) {
      this.chipCharLimit = 23;
    }
    else if (window.innerWidth > 310) {
      this.chipCharLimit = 18;
    } else if (window.innerWidth > 260) {
      this.chipCharLimit = 13;
    }
    else {
      this.chipCharLimit = 7;
    }
  }

  onSubmit() {
    this.attachmentService.onAttachmentsRequest.next();
    this.attachmentService.onAttachmentsToRemoveRequest.next();
    if (this.isEditMode)
      this.editMessage();
    else
      this.uploadMessage();
  }

  uploadMessage() {
    const form = this.uploadForm.value;
    this.mailService.uploadMessage(this.selectedConnections, form.body, form.subject, this.attachments)
      .then(() => {
        this.mailService.onSuccess('Message Sent');
        this.resetUploader();
      })
      .catch((error) => {
        this.mailService.onError('An error occured in sending this message', error)
      })
  }

  editMessage() {
    if (this.mailService.isUserAllowedToEdit(this.uploadToEdit.sender.uid)) {
      this.mailService.editMessage(this.uploadToEdit, this.getChangedFields(), this.attachmentsToRemove)
        .then(() => {
          this.mailService.onSuccess("Message Updated");
          this.uploadService.uploadClicked.next(null);
          this.resetUploader()
        })
        .catch((error) => {
          this.mailService.onError("Error Updating Message.", error);
        })
    } else {
      //..not authorized
    }
  }

  getAttachments(event: Attachment[]) {
    this.attachments = event;
  }

  getAttachmentsToRemove(event: Attachment[]) {
    this.attachmentsToRemove = event;
  }

  getChangedFields() {
    let changedFields = {};
    Object.keys(this.uploadForm.controls).map(field => {
      if (!this.uploadForm.controls[field].pristine)
        changedFields[field] = this.uploadForm.value[field];
    });
    if (JSON.stringify(this.selectedConnectionsOrig) !== JSON.stringify(this.selectedConnections)) {
      changedFields['recipients'] = this.selectedConnections;
    }
    changedFields['attachments'] = this.attachments;
    return changedFields;
  }

  onCancel() {
    this.resetUploader();
  }

  resetUploader() {
    this.onClose.next();
    this.connectionsFormService.resetConnectionForm.next();
    this.uploadForm.reset();
    this.attachments = [];
    this.attachmentsToRemove = [];
    this.isEditMode = false;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
