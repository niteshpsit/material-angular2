import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

const headers = new Headers({ 'Content-Type': 'application/json' });
const options = new RequestOptions({ headers: headers });

@Injectable()
export class ReleaseService {
    url: string = '/api/release'
    getReleaseCalendarURL = 'http://136.225.104.48:8080/calender/user/get';
    postURL = 'http://136.225.104.48:8080/calender/user/add';
    releaseTypeURL = 'http://136.225.104.48:8080/calender/user/releaseType';
    dropURL = 'http://136.225.104.48:8080/calender/user/deliveryDrop';
    deleteURL = 'http://136.225.104.48:8080/calender/user/delete?id=';
    updateReleaseURL = 'http://136.225.104.48:8080/calender/user/update';
    constructor(private http: Http) { }
    getHeroes(): any {
        return this.http.get(this.getReleaseCalendarURL).toPromise()
    }
    getReleaseTypes(){
        return this.http.get(this.releaseTypeURL).toPromise()
    }
    getDropList(){
        return this.http.get(this.dropURL).toPromise()
    }
    addRelease(release: any): Promise<any> {
        delete release.id
        return this.http.post(this.postURL, release, options).toPromise()
    }
    updateRelease(release: any){
        return this.http.post(this.updateReleaseURL, release, options).toPromise()
    }
    deleteRelease(id){
        let deleteURL = this.deleteURL + id;
        return this.http.post(deleteURL,null, options).toPromise()
    }
}