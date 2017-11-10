import { Component, OnInit, Inject } from '@angular/core';
import { ReleaseService } from '../../services/release.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { MatDialog } from '@angular/material';
import { config, commonFunctions } from '../../constant/constant';
import 'rxjs/add/observable/of';

@Component({
    selector: 'release',
    templateUrl: 'release.component.html',
    styleUrls: ['./release.component.css'],
})
export class ReleaseComponent {
    isRelease: boolean = false;
    isNewRelease: boolean = true;
    loading: boolean = false;
    taskTypeList: string[] = [];
    releaseList: string[] = [];
    releaseDataList: any = [];
    releaseData: any = {
        id:"",
        name: '',
        label: "",
        releases: []
    }
    newLi: string = 'new'
    data: string = ''
    displayedColumns: string[] = [];
    releaseDataInfo:any
    constructor(
        private releaseService: ReleaseService,
        iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        public dialog: MatDialog) {

        this.isRelease = config.getParameterByName('page', undefined) === 'release';
    }
    getReleaseData(): void {
        this.loading = false;
        this.displayedColumns = ['name', 'label'];
        this.releaseService.getReleaseData().then(releaseData => {
            console.log("====re",releaseData);
            
            this.releaseDataInfo  = releaseData;
            //this.releaseDataList = new ExampleDataSource(JSON.parse(releaseData._body))
            this.releaseDataList = new ExampleDataSource(releaseData)
            this.loading = true;
            console.log("======asfd",this.releaseDataInfo)
            this.releaseDataInfo[0].releases.forEach((release)=>{
                console.log("=======in");
                this.displayedColumns.push(release.name)
            })
            console.log("===",this.displayedColumns);
        });
    }
    getReleases() {
        this.releaseList = [];
        this.releaseService.getRelease()
            .then(list => {
                // need to parse when api get ready
                this.releaseList = list;
                console.log("releaseList", this.releaseList);
            })
    }
    getTaskType() {
        this.taskTypeList = [];
        this.releaseService.getTaskType()
            .then(list => {
                // need to parse when api get ready
                this.taskTypeList = list;
                console.log("taskTypeLsit", this.taskTypeList);
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
                }
            })
        }
        else {
            let release = { name: releaseName, needToDeliver: event.checked }
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
        else {
            let release = { name: releaseName, delivered: event.checked }
            this.releaseData.releases.push(release);
        }
    }
    onSubmitNew() {
        // if (this.releaseData.id && this.releaseData.id !== "") {
        //   this.releaseService.updateReleaseData(this.releaseData)
        //     .then((data) => {
        //       this.resetReleaase();
        //       this.isNewRelease = !this.isNewRelease;
        //       this.getReleaseData();
        //     })
        // } else {
          this.releaseService.addReleaseData(this.releaseData)
            .then((data) => {
                console.log("=====data",data);
              this.resetReleaase();
              this.isNewRelease = !this.isNewRelease;
              this.getReleaseData();
            })
        //}
    
      }
    resetReleaase() {
        this.releaseData = {
            name: '',
            label: "",
            releases: []
        }
    }
    isValidRelease() {
        return this.releaseData.name && this.releaseData.label.trim() ? true : false;
    }
    onAddNewReleaase() {
        this.resetReleaase();
        this.isNewRelease = !this.isNewRelease
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
