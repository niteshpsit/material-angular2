import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReleaseComponent } from './component/release/release.component'

const routes: Routes = [
    { path: '', component: ReleaseComponent },
    { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes) ],
})
export class AppRoutingModule {}