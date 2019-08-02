import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxComponent } from './inbox.component';
import { HeadnavModule } from 'src/app/mughub/headnav/headnav.module';
import { UploadComponent } from '../upload/upload.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UploaderModule } from '../uploader/uploader.module';
import { MonthStringPipe } from '../../pipes/month-string.pipe';
import { MaterialComponentsModule } from '../../angular-material/material-components.module';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    InboxComponent,
    UploadComponent,
    MonthStringPipe
  ],
  imports: [
    CommonModule,
    HeadnavModule,
    MaterialComponentsModule,
    MatSidenavModule,
    UploaderModule,
    FontAwesomeModule
  ]
})
export class InboxModule {
  constructor() {
    library.add(faTrophy)
  }
}
