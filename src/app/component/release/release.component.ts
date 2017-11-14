import { Component, OnInit, Inject } from '@angular/core';
import { ReleaseService } from '../../services/release.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { MatDialog } from '@angular/material';
import { ConfirmDialog } from '../confirm-dialog/confirmDialog.component';
import { config, commonFunctions } from '../../constant/constant';
import 'rxjs/add/observable/of';

//const baseUrl = 'release/';
const baseUrl = '';
@Component({
    selector: 'release',
    templateUrl: 'release.component.html',
    styleUrls: ['./release.component.css'],
})
export class ReleaseComponent {
    page: string = 'releasecontent';
    loading: boolean = false;
    taskTypeList: string[] = [];
    releaseList: string[] = [];
    releaseDataList: any = [];
    releaseData: any = {
        id:"",
        name: '',
        label: "",
        elementStatus:"new",
        releases: []
    }
    newLi: string = 'new'
    data: string = ''
    displayedColumns: string[] = [];
    columnList: string[] = [];
    tableData = [];
    constructor(
        private releaseService: ReleaseService,
        iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        public dialog: MatDialog) {
        let pageType = config.getParameterByName('page', undefined);
        if(pageType === config.releasecontentURL || pageType === config.releasecalendarURL)
            this.releaseService.page = pageType;
        else
            this.releaseService.page = null;
        iconRegistry.addSvgIcon(
            'clear',
            sanitizer.bypassSecurityTrustResourceUrl(baseUrl + 'assets/ic_clear_black_24px.svg'));
          iconRegistry.addSvgIcon(
            'edit',
            sanitizer.bypassSecurityTrustResourceUrl(baseUrl + 'assets/ic_create_black_24px.svg'));
    }
    getReleaseData(): void {
        //this.releaseDataList = undefined;
        this.loading = false;
        this.displayedColumns = ['name', 'label', ...this.releaseList];
        this.releaseService.getReleaseData().then(releaList => {
            let releaseDataInfo;
            this.tableData = [];
            releaseDataInfo = JSON.parse(releaList._body)
            releaseDataInfo.forEach(releaseData=>{
                let tableColumn = { name: releaseData.name, label:releaseData.label, id:releaseData.id, releases: releaseData.releases }
                releaseData.releases.forEach(release=>{
                    tableColumn[release.name] = { needToBeDeliver: release.needToBeDeliver, delivered: release.delivered };
                    if(!commonFunctions.isInArray(this.displayedColumns,release.name)){
                        this.releaseData[release.name] = { needToBeDeliver: false, delivered: false }
                        this.releaseList.push(release.name);
                        this.displayedColumns.push(release.name);
                    }
                });
                this.tableData.push(tableColumn);
            })
            if(this.releaseService.page === config.releasecontentURL){
                this.tableData.push(this.releaseData);
                this.displayedColumns.push("id");
            }
            this.releaseDataList = new ExampleDataSource(this.tableData);
            this.loading = true;
            
        });
    }
    getReleases() {
        this.releaseList = [];
        this.releaseData =  { id:"", name: '',  label: "",  elementStatus:"new",  releases: [] }
        this.releaseService.getRelease()
        .then(list => {
            this.releaseList = JSON.parse(list._body);
            this.releaseList.forEach(release=>{
                this.releaseData[release] = { needToBeDeliver: false, delivered: false }
            })
            this.getReleaseData();
        })
        .catch(error=>{
            console.log("release List error",error);
            this.getReleaseData();
            this.releaseList = [];
        })
    }
    getTaskType() {
        this.taskTypeList = [];
        this.releaseService.getTaskType()
            .then(list => {
                // need to parse when api get ready
                let taskList = JSON.parse(list._body);
                taskList.forEach(task=>{
                    this.taskTypeList.push(task.taskType);
                })
            })
            .catch(error=>{
                console.log("====error",error)
                this.taskTypeList = [];
            })
    }
    ngOnInit(): void {
        this.getReleases();
        this.getTaskType();
    }
    onChangeTBDStatus(event, releaseName) {
        if (commonFunctions.containsObject(releaseName, this.releaseData.releases)) {
            this.releaseData.releases.forEach(release => {
                if (release.name === releaseName) {
                    release['needToBeDeliver'] = event.checked;
                    release['delivered'] = release.delivered ? release.delivered : false ;
                }
            })
        }
        else {
            let release = { name: releaseName, needToBeDeliver: event.checked, delivered: false }
            this.releaseData.releases.push(release);
        }
    }
    onChangeDeliverStatus(event, releaseName) {
        if (commonFunctions.containsObject(releaseName, this.releaseData.releases)) {
            this.releaseData.releases.forEach(release => {
                if (release.name === releaseName) {
                    release['delivered'] = event.checked;
                    release['needToBeDeliver'] = release.needToBeDeliver ? release.needToBeDeliver : false ;
                }
            })
        }
        else {
            let release = { name: releaseName, delivered: event.checked, needToBeDeliver: false }
            this.releaseData.releases.push(release);
        }
        console.log("==this",this.releaseData);
    }
    onSubmitNew() {
        let releaseData = { id:this.releaseData.id, name: this.releaseData.name, label:this.releaseData.label, releases:this.releaseData.releases };
        if (releaseData.id && releaseData.id !== "") {
            this.releaseService.updateReleaseData(releaseData)
            .then((data) => {
                this.getReleases();
            })
            .catch(error=>{
                let message = JSON.parse(error._body).Message;
                this.errorDialog(message);
            })
        } else {
            this.releaseService.addReleaseData(releaseData)
            .then((data) => {
                this.getReleases();
            })
            .catch(error=>{
                let message = JSON.parse(error._body).Message;
                this.errorDialog(message);
            })
        }
    
    }
    resetReleaase() {
        this.releaseData = {
            id:"",
            name: '',
            label: "",
            elementStatus:"new",
            releases: []
        }
        this.releaseList.forEach((column)=>{
            this.releaseData[column] = { needToBeDeliver: false, delivered: false }
        });
        this.releaseData.elementStatus = "new";
        this.tableData[this.tableData.length -1] = this.releaseData;
        this.releaseDataList = new ExampleDataSource(this.tableData);
    }
    isValidRelease() {
        return this.releaseData.name && this.releaseData.label.trim() ? true : false;
    }
    editRelease(ele) {
        let newObject = Object.assign({}, ele)
        this.releaseData.id = newObject.id;
        this.releaseData.name = newObject.name;
        this.releaseData.label = newObject.label;
        this.releaseData.releases = [...newObject.releases];
        this.releaseList.forEach((column)=>{
            if(newObject[column]){
                this.releaseData[column] = {  ...newObject[column] } ;
            }
            else {
                this.releaseData[column] = { needToBeDeliver: false, delivered: false }
            }
        })
        this.releaseData.elementStatus = "edit";
        this.tableData[this.tableData.length -1] = this.releaseData;
        this.releaseDataList = new ExampleDataSource(this.tableData);
    }
    deleteRelease(id) {
        this.releaseService.deleteReleaseContent(id)
        .then((data) => {
            this.getReleases();
        })
    }
    confirmDialog(id): void {
        let dialogRef = this.dialog.open(ConfirmDialog, {
          width: '500px',
          data: { id: id ? id : undefined }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result && result.id)
            this.deleteRelease(result.id);
        });
    }
    errorDialog(message){
        let dialogRef = this.dialog.open(ConfirmDialog, {
            width: '500px',
            data: { 
                header:" ",
                info:message ? message: "error",
                type:"error"
            }
        });
    
        dialogRef.afterClosed().subscribe(result => {
            console.log("===this.error",result);
        });
    }
}

class ExampleDataSource extends DataSource<any> {
    data: any;
    constructor(data: any) {
        super();
        this.data = data;
    }
    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Element[]> {
        return Observable.of(this.data);
    }

    disconnect() { }
}
