import { Component, OnInit, Inject  } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

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
        var csvData = this.ConvertToCSV(this.displayData.info);
        var a = document.createElement("a");
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        var blob = new Blob([csvData], { type: 'text/csv' });
        var url= window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'Task-List-' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        
    }

    ConvertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = 'Task,Status';
        str += '\r\n';
        for (var key in array) {
            var line = '';
            line = key + ',' + array[key];
            str += line + '\r\n';
        }
        return str;
    }
}