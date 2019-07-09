import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponentsModule } from 'src/app/shared/angular-material/material-components.module';
import { UploadsComponent } from './uploads.component';
import { UploadsRoutingModule } from './uploads-routing.module';
import { UploadComponent } from './upload/upload.component';

@NgModule({
  declarations: [UploadsComponent, UploadComponent],
  imports: [
    CommonModule,
    MaterialComponentsModule,
    UploadsRoutingModule
  ]
})

export class UploadsModule { }
