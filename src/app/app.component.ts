import { Component, OnInit, Inject } from '@angular/core';
import { ReleaseService } from './services/release.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { MatDialog } from '@angular/material';
import { ConfirmDialog } from './component/confirm-dialog/confirmDialog.component';
import { config, commonFunctions } from './constant/constant';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  title = 'app';
  relCalendar: any = [];
  release: any = { id: '', releaseDrop: "", deliveryType: "", label: "", actDate: "", planDate: "", status: "", version: "" }
  displayedColumns = ['releaseDrop', 'deliveryType', 'rState', 'label', 'actDate', 'planDate', 'version', 'status'];
  releaseStatus = [{ value: "pending", viewValue: "PENDING" }, { value: "done", viewValue: "DONE" }]
  slipStatus = [{ value: false, viewValue: "No" }, { value: true, viewValue: "Yes" }]
  dropList: any = [];
  deliveryList: any = [];
  loading: boolean = false;
  isNewRelease: boolean = false;
  startDate = new Date();
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
  getRelCalendar(): void {
    this.loading = false;
    if (this.releaseService.page === config.releasecalendarURL && !commonFunctions.isInArray(this.displayedColumns, 'id'))
      this.displayedColumns.push('id');
    this.releaseService.getHeroes().then(relCalendar => {
      let tableData = commonFunctions.getValidResponse(relCalendar);
      this.relCalendar = new ExampleDataSource(tableData);
      this.loading = true;
    }
    );
  }
  getDropList() {

    this.releaseService.getDropList()
      .then((res: any) => {
        let data = commonFunctions.getValidResponse(res);
        data.forEach((drop) => {
          this.dropList.push({ value: drop.delivery, viewValue: drop.delivery })
        });
      })
  }
  getDeliveryList() {
    this.releaseService.getReleaseTypes()
      .then((res: any) => {
        let data = commonFunctions.getValidResponse(res);
        data.forEach((type) => {
          this.deliveryList.push({ value: type.releaseType, viewValue: type.releaseType })
        });
      })
  }
  ngOnInit(): void {
    this.getRelCalendar();
    this.getDropList();
    this.getDeliveryList();
  }
  onAddNewReleaase() {
    this.resetReleaase();
    this.isNewRelease = !this.isNewRelease
  }
  resetReleaase() {
    this.release = {
      id: "",
      releaseDrop: "",
      deliveryType: "",
      rState: "",
      label: "",
      actDate: "",
      planDate: "",
      status: "",
      version: ""
    }
  }
  onSubmitNew() {
    this.apiInprogress = true;
    if (this.release.id && this.release.id !== "") {
      this.releaseService.updateRelease(this.release)
        .then((data) => {
          this.setFalseApiCaling();
          this.resetReleaase();
          this.isNewRelease = !this.isNewRelease;
          this.getRelCalendar();
        })
        .catch(error => {
          this.setFalseApiCaling();
          let message = commonFunctions.getValidErrorMessage(error);
          this.errorDialog(message);
        })
    } else {
      this.releaseService.addRelease(this.release)
        .then((data) => {
          this.setFalseApiCaling();
          this.resetReleaase();
          this.isNewRelease = !this.isNewRelease;
          this.getRelCalendar();
        })
        .catch(error => {
          this.setFalseApiCaling();
          let message = commonFunctions.getValidErrorMessage(error);
          this.errorDialog(message);
        })
    }

  }
  onChangeStatus(event){
    if(event.value === 'pending'){
      this.release.actDate = "";
    }
  }
  setFalseApiCaling() {
    this.apiInprogress = false;
  }
  deleteRelease(id) {
    this.releaseService.deleteRelease(id)
      .then((data) => {
        this.getRelCalendar();
      })
  }
  editRelease(ele) {
    this.release.id = ele.id;
    this.release.releaseDrop = ele.releaseDrop
    this.release.deliveryType = ele.deliveryType
    this.release.rState = ele.rState
    this.release.label = ele.label
    this.release.actDate = (ele.id && ele.actDate) ? new Date(ele.actDate).toISOString() : '';
    this.release.planDate = new Date(ele.planDate).toISOString()
    this.release.version = ele.version
    this.release.status = ele.status;
    this.release.overrideSlip = false;
    this.isNewRelease = true;
  }
  isValidRelease() {
    if (this.release.id && this.release.id !== "" && this.release.status === "done")
      return this.release.releaseDrop && this.release.deliveryType && this.release.planDate && this.release.version && this.release.actDate ? true : false;
    return this.release.releaseDrop && this.release.deliveryType && this.release.planDate && this.release.version ? true : false;
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
  gotoEditReleaseCalendarPage() {
    let url = `${config.baseFolderURL}?page=${config.releasecalendarURL}`;
    window.location.href = url
  }
  errorDialog(message) {
    let errorMessage = config.ERROR['401'];
    if (typeof message !== 'object') {
      errorMessage = message;
      var error = "error";
    }
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: '500px',
      data: {
        header: "Error:",
        info: message ? message : "error",
        type: error ? error : "downloadError",
        errorMessage: errorMessage
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
