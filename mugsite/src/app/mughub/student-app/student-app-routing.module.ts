import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StudentAppComponent } from './student-app.component';
import { AuthGuard } from '../auth/auth.guard';
import { InboxComponent } from 'src/app/shared/mail/inbox/inbox.component';

const routes: Routes = [
  //lazy loaded
  {
    path: '', component: StudentAppComponent, canActivate: [AuthGuard], children: [
      { path: '', redirectTo: 'mail/inbox', pathMatch: 'full' },
      { path: 'mail/inbox', component: InboxComponent },
      { path: '**', redirectTo: 'mail/inbox', pathMatch: 'full' }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class StudentAppRoutingModule { }
