import { Component, OnInit, Inject  } from '@angular/core';
import { ReleaseService } from './services/release.service';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';
import {MatDialog} from '@angular/material';
import { ConfirmDialog } from './component/confirmDialog.component'
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ReleaseService]
})

export class AppComponent implements OnInit  {
  title = 'app';
  relCalendar:any = [];
  release:any = { id:'', releaseDrop:"",  deliveryType:"",  label:"",   actDate:"",  planDate:"",  status:"", version:""  }
  displayedColumns = ['releaseDrop', 'deliveryType', 'label', 'actDate','planDate','version', 'status', 'id'];
  releaseStatus = [ { value: "pending", viewValue: "PENDING" },{ value: "done", viewValue: "DONE" }]
  dropList:any = [];
  deliveryList:any= [];
  loading:boolean = false;
  isNewRelease:boolean = false;
  constructor(
    private releaseService: ReleaseService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    public dialog: MatDialog ) {

    iconRegistry.addSvgIcon(
      'clear',
      sanitizer.bypassSecurityTrustResourceUrl('assets/ic_clear_black_24px.svg'));
    iconRegistry.addSvgIcon(
      'edit',
      sanitizer.bypassSecurityTrustResourceUrl('assets/ic_create_black_24px.svg'));
  }
  getRelCalendar(): void {
    this.loading = false;
    this.releaseService.getHeroes().then(relCalendar =>{
      this.relCalendar = new ExampleDataSource(JSON.parse(relCalendar._body))
      this.loading = true;
    }
    );
  }
  getDropList(){
    
    this.releaseService.getDropList()
    .then((res: any)=>{
      let data = JSON.parse(res._body);
      data.forEach( (drop) => {
        this.dropList.push({ value: drop.delivery, viewValue: drop.delivery })
      });
    })
  }
  getDeliveryList(){
    this.releaseService.getReleaseTypes()
    .then((res: any)=>{
      let data = JSON.parse(res._body);
      data.forEach( (type) => {
        this.deliveryList.push({ value: type.releaseType, viewValue: type.releaseType })
      });
    })
  }
  ngOnInit(): void {
    this.getRelCalendar();
    this.getDropList();
    this.getDeliveryList();
  }
  onAddNewReleaase(){
    this.resetReleaase();
    this.isNewRelease = !this.isNewRelease
  }
  resetReleaase(){
    this.release = {
      id:"",
      releaseDrop:"",
      deliveryType:"",
      label:"",
      actDate:"",
      planDate:"",
      status:"",
      version:""
    }
  }
  onSubmitNew(){
    if(this.release.id && this.release.id !== "") {
      this.releaseService.updateRelease(this.release)
      .then((data)=>{
        this.resetReleaase();
        this.isNewRelease = !this.isNewRelease;
        this.getRelCalendar();
      })
    } else {
      this.releaseService.addRelease(this.release)
      .then((data)=>{
        this.resetReleaase();
        this.isNewRelease = !this.isNewRelease;
        this.getRelCalendar();
      })
    }
    
  }
  deleteRelease(id){
    this.releaseService.deleteRelease(id)
    .then((data)=>{
      this.getRelCalendar();
    })
  }
  editRelease(ele){
    this.release.id = ele.id;
    this.release.releaseDrop = ele.releaseDrop
    this.release.deliveryType = ele.deliveryType
    this.release.label = ele.label
    this.release.actDate = ( ele.id && ele.actDate ) ? new Date(ele.actDate).toISOString() : '';
    this.release.planDate = new Date(ele.planDate).toISOString()
    this.release.version = ele.version
    this.release.status = ele.status;
    this.isNewRelease = true;
  }
  isValidRelease(){
    return this.release.releaseDrop && this.release.deliveryType && this.release.label && this.release.planDate && this.release.version  ? true : false;
  }
  openDialog(id): void {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: '500px',
      data: { id:id ? id : undefined }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.id) 
        this.deleteRelease(result.id);
    });
  }
}

class ExampleDataSource extends DataSource<any> {
  data:any;
  constructor(data:any) {
    super();
    this.data = data;
   }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Element[]> {
    return Observable.of(this.data);
  }

  disconnect() {}
}
