import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';  
import { NgModule } from '@angular/core';
import {MatButtonModule, MatCheckboxModule, MatTableModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material';
import {MatInputModule} from '@angular/material';
import {MatSelectModule} from '@angular/material';
import {MatDatepickerModule, MatNativeDateModule} from '@angular/material';
import {MatProgressSpinnerModule} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatIconModule } from '@angular/material';
import { MomentModule } from 'angular2-moment';
import {MatDialogModule} from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { ConfirmDialog } from './component/confirm-dialog/confirmDialog.component'
import { ReleaseComponent } from './component/release/release.component'
import { AppRoutingModule } from './app-router.module';

@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialog,
    ReleaseComponent
  ],
  imports: [    
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    HttpModule,
    MomentModule,
    MatIconModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents:[ ConfirmDialog ]
})
export class AppModule { }
