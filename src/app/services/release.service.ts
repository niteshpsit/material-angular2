import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { config } from'../constant/constant';
const headers = new Headers({ 'Content-Type': 'application/json' });
const options = new RequestOptions({ headers: headers });

@Injectable()
export class ReleaseService {
    tpgName: string = '';
    page: any = null
    constructor( private http: Http ) {}
    getBaseURL(): string{
        return config.baseUrl+'/calendar/cpm';
    }
    getHeroes(): any {
        let url = this.getBaseURL() + config.getReleaseCalendarURL;
        return this.http.get(url).toPromise()
    }
    getReleaseTypes(){
        let url = this.getBaseURL() + config.releaseTypeURL;
        return this.http.get(url).toPromise()
    }
    getDropList(){
        let url = this.getBaseURL() + config.dropURL;
        return this.http.get(url).toPromise()
    }
    addRelease(release: any): Promise<any> {
        let url = this.getBaseURL() + config.addReleaseURL;
        delete release.id;
        delete release.actDate;
        delete release.status;
        return this.http.post(url, release, options).toPromise()
    }
    updateRelease(release: any){
        let url = this.getBaseURL() + config.updateReleaseURL;
        if( !release.actDate || release.actDate === "" || release.actDate === null ) 
            delete release.actDate;
        if( !release.status || release.status === "" )
            delete release.status;
        return this.http.post(url, release, options).toPromise()
    }
    deleteRelease(id){
        let url = this.getBaseURL() + config.deleteURL;
        url = url + id;
        return this.http.post(url,null, options).toPromise()
    }
    getReleaseData(): Promise<any> {
        let url = this.getBaseURL() + config.releaseDataURL;
        return this.http.get(url).toPromise()
        // return new Promise((resolve, reject)=>{
        //     resolve(
        //         [{
        //             "id":"1",
        //             "name":"BSUC-1",
        //             "label":"label-1",
        //             "releases": [
        //                 {
        //                     "name": "1747",
        //                     "delivered":false,
        //                     "needToBeDeliver":true
        //                 },
        //                 {
        //                     "name": "1750",
        //                     "delivered":true,
        //                     "needToBeDeliver":true
        //                 },
        //                 {
        //                     "name": "1747EP01",
        //                     "delivered":false,
        //                     "needToBeDeliver":false
        //                 },
        //                 {
        //                     "name": "1747 REPACK",
        //                     "delivered":true,
        //                     "needToBeDeliver":true
        //                 }
        //             ]
        //         },{
        //             "id":"2",
        //             "name":"BSUC-2",
        //             "label":"label-2",
        //             "releases": [
        //                 {
        //                     "name": "1747",
        //                     "delivered":false,
        //                     "needToBeDeliver":true
        //                 },
        //                 {
        //                     "name": "1750",
        //                     "delivered":true,
        //                     "needToBeDeliver":true
        //                 },
        //                 {
        //                     "name": "1747EP01",
        //                     "delivered":"false",
        //                     "needToBeDeliver":false
        //                 },
        //                 {
        //                     "name": "1747 REPACK",
        //                     "delivered":true,
        //                     "needToBeDeliver":true
        //                 },
        //                 {
        //                     "name": "1747 REPACK-1",
        //                     "delivered":true,
        //                     "needToBeDeliver":true
        //                 }
        //             ]
        //         },{
        //             "id":"3",
        //             "name":"BSUC-3",
        //             "label":"label-3",
        //             "releases": [
        //                 {
        //                     "name": "1747",
        //                     "delivered":false,
        //                     "needToBeDeliver":true
        //                 },
        //                 {
        //                     "name": "1750",
        //                     "delivered":true,
        //                     "needToBeDeliver":true
        //                 },
        //                 {
        //                     "name": "1747 REPACK-1",
        //                     "delivered":false,
        //                     "needToBeDeliver":false
        //                 }
        //             ]
        //         }]
        //     )
        // })
    }
    getRelease():Promise<any>{
        let url = this.getBaseURL() + config.releaseURL;
        return this.http.get(url).toPromise()
        // return new Promise((resolve, reject)=>{
        //     resolve(['1747','1750','1747EP01','1747 REPACK'])
        // })
    }
    getTaskType():Promise<any>{
        let url = this.getBaseURL() + config.taskType;
        return this.http.get(url).toPromise()
        // return new Promise((resolve, reject)=>{
        //     resolve(['BSUC-1','BSUC-2','BSUC-3','BSUC-4'])
        // })
    }
    addReleaseData(release){
        let url = this.getBaseURL() + config.addReleaseDataURL;
        delete release.id;
        return this.http.post(url, release, options).toPromise()
    }
    updateReleaseData(release){
        let url = this.getBaseURL() + config.updateReleaseDataURL;
        return this.http.post(url, release, options).toPromise()
    }
    deleteReleaseContent(id){
        let url = this.getBaseURL() + config.deleteContentURL;
        url = `${url}?id=${id}`
        return this.http.post(url,null, options).toPromise()
    }
}