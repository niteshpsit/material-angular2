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
        id: "",
        name: '',
        label: "",
        elementStatus: "new",
        releases: []
    }
    newLi: string = 'new'
    data: string = ''
    displayedColumns: string[] = [];
    columnList: string[] = [];
    tableData = [];
    dynamicClass: object = {}
    apiInprogress: boolean = false;
    constructor(
        private releaseService: ReleaseService,
        iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        public dialog: MatDialog) {
        let pageType = config.getParameterByName('page', undefined);
        if (pageType === config.releasecontentURL || pageType === config.releasecalendarURL)
            this.releaseService.page = pageType;
        else
            this.releaseService.page = null;
        iconRegistry.addSvgIcon(
            'clear',
            sanitizer.bypassSecurityTrustResourceUrl(config.baseFolderURL + 'assets/ic_clear_black_24px.svg'));
        iconRegistry.addSvgIcon(
            'edit',
            sanitizer.bypassSecurityTrustResourceUrl(config.baseFolderURL + 'assets/ic_create_black_24px.svg'));
    }
    getReleaseData(): void {
        //this.releaseDataList = undefined;
        this.loading = false;
        this.displayedColumns = ['name', 'label', ...this.releaseList];
        this.releaseService.getReleaseData().then(releaList => {
            let releaseDataInfo;
            this.tableData = [];
            releaseDataInfo = commonFunctions.getValidResponse(releaList);
            releaseDataInfo.forEach((releaseData,i) => {
                let tableColumn = { name: releaseData.name, label: releaseData.label, id: i+1, releases: releaseData.releases }
                releaseData.releases.forEach(release => {
                    tableColumn[release.name] = { needToBeDeliver: release.needToBeDeliver, delivered: release.delivered };
                    // if(!commonFunctions.isInArray(this.displayedColumns,release.name)){
                    //     this.releaseData[release.name] = { needToBeDeliver: false, delivered: false }
                    //     this.releaseList.push(release.name);
                    //     this.displayedColumns.push(release.name);
                    // }
                });
                this.tableData.push(tableColumn);
            })
            if (this.releaseService.page === config.releasecontentURL) {
                this.tableData.push(this.releaseData);
                this.displayedColumns.push("id");
            }
            this.releaseDataList = new ExampleDataSource(this.tableData);
            this.loading = true;

        });
    }
    getReleases() {
        this.releaseList = [];
        this.releaseData = this.getInitalReleaseData()
        this.releaseService.getRelease()
            .then(list => {
                this.releaseList = commonFunctions.getValidResponse(list);
                this.releaseList.forEach(release => {
                    this.releaseData[release] = { needToBeDeliver: false, delivered: false }
                })
                this.getReleaseData();
            })
            .catch(error => {
                this.releaseList = [];
                this.getReleaseData();
            })
    }
    getInitalReleaseData() {
        return { id: "", name: '', label: "", elementStatus: "new", releases: [] }
    }
    getUpdatedReleaseData() {
        return { id: this.releaseData.id, name: this.releaseData.name, label: this.releaseData.label, releases: this.releaseData.releases };
    }
    getTaskType() {
        this.taskTypeList = [];
        this.releaseService.getTaskType()
            .then(list => {
                let taskList = commonFunctions.getValidResponse(list);
                taskList.forEach(task => {
                    this.taskTypeList.push(task.taskType);
                })
            })
            .catch(error => {
                this.taskTypeList = [];
            })
    }
    ngOnInit(): void {
        this.getReleases();
        this.getTaskType();
    }
    onChangeTBDStatus(event, releaseName) {
        if (this.releaseData[releaseName].needToBeDeliver === false) {
            this.releaseData[releaseName].delivered = false;
        }
        if (commonFunctions.containsObject(releaseName, this.releaseData.releases)) {
            this.releaseData.releases.forEach(release => {
                if (release.name === releaseName) {
                    release['needToBeDeliver'] = event.checked;
                    release['delivered'] = false;
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
                }
            })
        }
    }
    onSubmitNew() {
        // Enabling Loader for Create and Update
        this.apiInprogress = true;
        let releaseData = this.getUpdatedReleaseData();
        if (releaseData.id && releaseData.id !== "") {
            releaseData['force'] = false;
            this.updateReleaseData(releaseData);
        } else {
            this.createReleaseData(releaseData);
        }

    }
    createReleaseData(release) {
        this.releaseService.addReleaseData(release)
            .then((data) => {
                this.getReleases();
                this.setFalseApiCaling()
            })
            .catch(error => {
                this.setFalseApiCaling()
                let message = commonFunctions.getValidErrorMessage(error);
                this.errorDialog(message);
            })
    }
    updateReleaseData(release) {
        //this.releaseData['1747EP03'].validation = 'SLIP';
        this.releaseService.updateReleaseData(release)
            .then((data) => {
                this.getReleases();
                this.setFalseApiCaling()
            })
            .catch(error => {
                this.setFalseApiCaling();
                let response = commonFunctions.getValidResponse(error);
                if (response.validation && response.result) {
                    let message = ""
                    for(let key in response.result){
                        if(this.releaseData[key]){
                            this.releaseData[key].validation = response.result[key];
                            message = message + `${key}: ${response.result[key]}, `
                        }
                    }
                    message = `${message}
                    Still Wants To Continue ?`
                    this.confirmDialog(undefined, response, message);
                }
                else
                    this.errorDialog(response.message);
            })
    }
    // Setting Loader false for create and update
    setFalseApiCaling(){
        this.apiInprogress = false;
    }
    resetReleaase() {
        this.releaseData = this.getInitalReleaseData();
        this.releaseList.forEach((column) => {
            this.releaseData[column] = { needToBeDeliver: false, delivered: false }
        });
        this.releaseData.elementStatus = "new";
        this.tableData[this.tableData.length - 1] = this.releaseData;
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
        this.releaseData.releases = [];
        newObject.releases.forEach(releases => {
            this.releaseData.releases.push({ ...releases })
        });
        this.releaseList.forEach((column) => {
            if (newObject[column]) {
                // Validation key for dynamic class for validation 
                this.releaseData[column] = { validation: "ok", ...newObject[column] };
            }
            else {
                this.releaseData[column] = { needToBeDeliver: false, delivered: false }
            }
        })
        this.releaseData.elementStatus = "edit";
        this.tableData[this.tableData.length - 1] = this.releaseData;
        this.releaseDataList = new ExampleDataSource(this.tableData);
    }
    deleteRelease(element) {
        this.releaseService.deleteReleaseContent(element)
        .then((data) => {
            this.getReleases();
        })
    }
    confirmDialog(element = undefined, res = undefined, msg = ""): void {
        let dialogRef = this.dialog.open(ConfirmDialog, {
            width: '500px',
            data: {
                id: element && element.id ? element.id : undefined,
                info: msg ? msg : undefined,
                type: (res && res.validation) ? "error" : undefined,
                validation: (res && res.validation) ? res.validation : false
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.id)
                this.deleteRelease(element);
            if (result && result.validation) {
                let releaseData = this.getUpdatedReleaseData();
                releaseData['force'] = true;
                this.updateReleaseData(releaseData);
            }
        });
    }
    gotoEditReleaseContentPage() {
        let url = `${config.baseFolderURL}?page=${config.releasecontentURL}`;
        window.location.href = url
    }
    errorDialog(message) {
        let dialogRef = this.dialog.open(ConfirmDialog, {
            width: '500px',
            data: {
                header: " ",
                info: message ? message : "error",
                type: "error"
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log("===this.error", result);
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
