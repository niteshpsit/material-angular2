import { Component, OnInit, Inject  } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { config, commonFunctions } from '../../constant/constant';

@Component({
    selector: 'confirm-dialog',
    templateUrl: 'confirmDialog.component.html',
})
export class ConfirmDialog {
displayData = {
    header:"Confirmation",
    info:"Are you sure you want to delete ?",
    type:"information",
    validation:false,
    errorMessage:""
}
constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
        this.displayData.header = data.header ? data.header : "Confirmation"
        this.displayData.info = data.info ? data.info : "Are you sure you want to delete ?"
        this.displayData.type = data.type ? data.type : "information"
        this.displayData.validation = data.validation ? true : false;
        this.displayData.errorMessage = data.errorMessage ? data.errorMessage : "";
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    onDownloadClick(): void {        
        commonFunctions.download(this.displayData.info, 'Task-List-');      
    }   
}