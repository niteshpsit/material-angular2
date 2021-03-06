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
    loading: boolean = false;// loading varialbe to table data loading
    taskTypeList: string[] = []; // List of tasks like BSUC, PBI, TR..
    releaseList: string[] = []; // List of Dynamic Release for making dynamic columns
    releaseDataList: any = [];  // Actul Data for table
    releaseData: any = {
        id: "",
        name: '',
        label: "",
        elementStatus: "new",
        releases: []
    } // Initial data for new entry , This is data of last row of table
    displayedColumns: string[] = []; // Column List including dynamic release list and contains 'id' as last value for editing view only
    tableData = []; // This will cantain table data before making actual data for table
    apiInprogress: boolean = false; // For loading in case of making new entry or updating old one 
    constructor(
        private releaseService: ReleaseService, // Injecting Release Service 
        iconRegistry: MatIconRegistry, 
        sanitizer: DomSanitizer,
        public dialog: MatDialog) {
        /**
         * This Block check the page type and open accordingly 
         */
        let pageType = config.getParameterByName('page', undefined);
        if (pageType === config.releasecontentURL || pageType === config.releasecalendarURL)
            this.releaseService.page = pageType;
        else
            this.releaseService.page = null;
        // To user svg file in our component
        iconRegistry.addSvgIcon(
            'clear',
            sanitizer.bypassSecurityTrustResourceUrl(config.baseFolderURL + 'assets/ic_clear_black_24px.svg'));
        iconRegistry.addSvgIcon(
            'edit',
            sanitizer.bypassSecurityTrustResourceUrl(config.baseFolderURL + 'assets/ic_create_black_24px.svg'));
    }
    /**
     * to get the release data to display in table
     */
    getReleaseData(): void {
        this.loading = false;// Setting Loader for display Loader
        this.displayedColumns = ['name', 'label', ...this.releaseList]; // Making the displayed column List with dynamic data
        this.releaseService.getReleaseData().then(releaList => { // Serive to get data 
            let releaseDataInfo; // 
            this.tableData = []; // Making empaty for insering new data;
            releaseDataInfo = commonFunctions.getValidResponse(releaList); // get Exact Body response from request data
            releaseDataInfo.forEach((releaseData,i) => {
                // This is individual row of table
                let tableColumn = { name: releaseData.name, label: releaseData.label, id: i+1, releases: releaseData.releases }
                // Making data for dynamic table 
                releaseData.releases.forEach(release => {
                    tableColumn[release.name] = { needToBeDeliver: release.needToBeDeliver, delivered: release.delivered };
                    // if(!commonFunctions.isInArray(this.displayedColumns,release.name)){
                    //     this.releaseData[release.name] = { needToBeDeliver: false, delivered: false }
                    //     this.releaseList.push(release.name);
                    //     this.displayedColumns.push(release.name);
                    // }
                });
                // Push individual row in table data
                this.tableData.push(tableColumn);
            })          
            // Push id ( To display last column for edit and delete permission ) in column list and data ( For create and update persistance )
            if (this.releaseService.page === config.releasecontentURL) {
                this.tableData.push(this.releaseData);
                this.displayedColumns.push("id");
            }
            // Get Actuall data for table
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
        if(this.checkReleaseData(releaseData)) {
            if (releaseData.id && releaseData.id !== "") {
                releaseData['force'] = false;
                this.updateReleaseData(releaseData);
            } else {               
                releaseData.releases = releaseData.releases.filter(release => release.needToBeDeliver !== false);
                if(Object.keys(releaseData.releases).length <= 0){
                    releaseData.releases = [{ needToBeDeliver: false, name:'9999 UNPLAN 01', delivered: false }];
                }
                this.createReleaseData(releaseData);
            }
        }
    }
    checkReleaseData(release) {
        for(let i=0;i<release.releases.length;i++) {
            if(release.releases[i].name.indexOf('UNPLAN') !== -1 && release.releases[i].needToBeDeliver === true ){
                this.setFalseApiCaling()
                let message = config.ERROR['402'];
                this.errorDialog(message);
                return false;               
            }
        }
        return true;      
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
        window.scrollTo(0,document.body.scrollHeight);
    }
    deleteRelease(element) {
        this.releaseService.deleteReleaseContent(element)
        .then((data) => {
            this.getReleases();
        })
    }
    getUnplanned(){
        this.releaseService.getUnplanned()
        .then((data) => {            
            let message = commonFunctions.getValidErrorMessage(data);
            commonFunctions.download(message, 'Unplanned-TR-');
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
    addClass(){
        var element = document.getElementById("cdk-overlay-0");
        element.classList.add("otherClass");
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
