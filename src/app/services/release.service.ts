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
        let url = this.getBaseURL() + config.getReleaseURL;
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
}