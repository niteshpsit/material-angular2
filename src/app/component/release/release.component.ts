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
    isRelease: boolean = false;
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
        this.isRelease = config.getParameterByName('page', undefined) === 'release';
        iconRegistry.addSvgIcon(
            'clear',
            sanitizer.bypassSecurityTrustResourceUrl(baseUrl + 'assets/ic_clear_black_24px.svg'));
          iconRegistry.addSvgIcon(
            'edit',
            sanitizer.bypassSecurityTrustResourceUrl(baseUrl + 'assets/ic_create_black_24px.svg'));
    }
    getReleaseData(): void {
        this.loading = false;
        this.displayedColumns = ['name', 'label'];
        this.releaseService.getReleaseData().then(releaList => {
            let releaseDataInfo  = releaList;
            this.tableData = [];
            this.columnList = [];
            //releaseDataInfo = new ExampleDataSource(JSON.parse(releaseData._body))
            releaseDataInfo.forEach(releaseData=>{
                let tableColumn = { name: releaseData.name, label:releaseData.label, id:releaseData.id, releases: releaseData.releases }
                releaseData.releases.forEach(release=>{
                    tableColumn[release.name] = { needToDeliver: release.needToDeliver, delivered: release.delivered };
                    if(!commonFunctions.isInArray(this.displayedColumns,release.name)){
                        this.releaseData[release.name] = { needToDeliver: false, delivered: false }
                        this.columnList.push(release.name);
                        this.displayedColumns.push(release.name);
                    }
                });
                this.tableData.push(tableColumn);
            })
            this.tableData.push(this.releaseData);
            // This is for last column
            this.displayedColumns.push("id");
            this.releaseDataList = new ExampleDataSource(this.tableData);
            this.loading = true;
            
        });
    }
    getReleases() {
        this.releaseList = [];
        this.releaseService.getRelease()
            .then(list => {
                // need to parse when api get ready
                this.releaseList = list;
            })
    }
    getTaskType() {
        this.taskTypeList = [];
        this.releaseService.getTaskType()
            .then(list => {
                // need to parse when api get ready
                this.taskTypeList = list;
            })
    }
    ngOnInit(): void {
        this.getReleaseData();
        this.getReleases();
        this.getTaskType();
    }
    onChangeTBDStatus(event, releaseName) {
        if (commonFunctions.containsObject(releaseName, this.releaseData.releases)) {
            this.releaseData.releases.forEach(release => {
                if (release.name === releaseName) {
                    release['needToDeliver'] = event.checked;
                    release['delivered'] = release.delivered ? release.delivered : false ;
                }
            })
        }
        else {
            let release = { name: releaseName, needToDeliver: event.checked, delivered: false }
            this.releaseData.releases.push(release);
        }
    }
    onChangeDeliverStatus(event, releaseName) {
        if (commonFunctions.containsObject(releaseName, this.releaseData.releases)) {
            this.releaseData.releases.forEach(release => {
                if (release.name === releaseName) {
                    release['delivered'] = event.checked;
                    release['needToDeliver'] = release.needToDeliver ? release.needToDeliver : false ;
                }
            })
        }
        else {
            let release = { name: releaseName, delivered: event.checked, needToDeliver: false }
            this.releaseData.releases.push(release);
        }
        console.log("==this",this.releaseData);
    }
    onSubmitNew() {
        let releaseData = { id:this.releaseData.id, name: this.releaseData.name, label:this.releaseData.label, releases:this.releaseData.releases };
        if (releaseData.id && releaseData.id !== "") {
            this.releaseService.updateReleaseData(releaseData)
            .then((data) => {
                this.resetReleaase();
                this.getReleaseData();
            })
        } else {
            this.releaseService.addReleaseData(releaseData)
            .then((data) => {
                this.resetReleaase();
                this.getReleaseData();
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
        this.columnList.forEach((column)=>{
            this.releaseData[column] = { needToDeliver: false, delivered: false }
        });
        this.releaseData.elementStatus = "new";
        this.tableData[this.tableData.length -1] = this.releaseData;
        this.releaseDataList = new ExampleDataSource(this.tableData);
    }
    isValidRelease() {
        return this.releaseData.name && this.releaseData.label.trim() ? true : false;
    }
    editRelease(ele) {
        this.releaseData.id = ele.id;
        this.releaseData.name = ele.name;
        this.releaseData.label = ele.label;
        this.releaseData.releases = ele.releases;
        this.columnList.forEach((column)=>{
            if(ele[column]){
                this.releaseData[column] = ele[column];
            }
            else {
                this.releaseData[column] = { needToDeliver: false, delivered: false }
            }
        })
        this.releaseData.elementStatus = "edit";
        this.tableData[this.tableData.length -1] = this.releaseData;
        this.releaseDataList = new ExampleDataSource(this.tableData);
    }
    deleteRelease(id) {
        this.releaseService.deleteReleaseContent(id)
        .then((data) => {
            this.getReleaseData();
        })
    }
    openDialog(id): void {
        let dialogRef = this.dialog.open(ConfirmDialog, {
          width: '500px',
          data: { id: id ? id : undefined }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result && result.id)
            this.deleteRelease(result.id);
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
