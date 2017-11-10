import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { config } from'../constant/constant';
const headers = new Headers({ 'Content-Type': 'application/json' });
const options = new RequestOptions({ headers: headers });

@Injectable()
export class ReleaseService {
    tpgName: string = '';
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
        //return this.http.get(url).toPromise()
        return new Promise((resolve, reject)=>{
            resolve(
                [{
                    "name":'BSUC',
                    "label":"xyx",
                    "new":"d",
                    "1747":"eqwer",
                    "releases": [
                        {
                            "name": "1747",
                            "delivered":false,
                            "needToDeliver":true
                        },
                        {
                            "name": "1750",
                            "delivered":true,
                            "needToDeliver":true
                        },
                        {
                            "name": "1747EP01",
                            "delivered":"false",
                            "needToDeliver":false
                        },
                        {
                            "name": "1747 REPACK",
                            "delivered":true,
                            "needToDeliver":true
                        }
                    ]
                }]
            )
        })
    }
    getRelease():Promise<any>{
        let url = this.getBaseURL() + config.releaseURL;
        //return this.http.get(url).toPromise()
        return new Promise((resolve, reject)=>{
            resolve(['1747','1750','1747EP01','1747 REPACK'])
        })
    }
    getTaskType():Promise<any>{
        let url = this.getBaseURL() + config.releaseURL;
        //return this.http.get(url).toPromise()
        return new Promise((resolve, reject)=>{
            resolve(['PBI','BSUC','TR'])
        })
    }
    addReleaseData(release){
        let url = this.getBaseURL() + config.addReleaseDataURL;
        delete release.id;
        return this.http.post(url, release, options).toPromise()
    }
}