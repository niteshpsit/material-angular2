
export const config = {
    //baseUrl: 'http://136.225.202.204:8080',
    baseUrl: 'http://136.225.202.95:8080',
    baseFolderURL:'release/',
    ///baseFolderURL:'/',
    releasecontentURL:'releasecontent',
    releasecalendarURL:'releasecalendar',
    getReleaseCalendarURL:'/get',
    addReleaseURL:'/add',
    releaseTypeURL:'/releaseType',
    dropURL:'/deliveryDrop',
    deleteURL:'/delete?id=',
    updateReleaseURL:'/update',
    releaseURL:'/fetchLabel',
    releaseDataURL:'/getTqa',
    addReleaseDataURL: '/addTqa',
    updateReleaseDataURL:'/updateTqa',
    deleteContentURL:'/deleteTqa',
    taskType: '/taskType',
    unplanURL: '/unplan',
    getParameterByName: function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    ERROR:{
        500:"INTERNAL SEREVER ERROR",
        401:"The operation could not completed successfully. Please click on download button to see the discrepancies.",
        402:"The entries for unplanned release can not be checked."
    }
}

export const commonFunctions = {
    containsObject: function(name, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i].name === name) {
                return true;
            }
        }
    
        return false;
    },
    isInArray: function(array, value) {
        return array.indexOf(value) > -1;
    },
    getValidResponse(response){
        if(commonFunctions.isValidJSON(response._body)){
            return JSON.parse(response._body);
        }
        else{
            return false;
        }
    },
    getValidErrorMessage(response){
        try{
            let jsonRes = commonFunctions.getValidResponse(response);
            if(jsonRes && jsonRes.message){
                return jsonRes.message;
            }
            else {
                throw new Error()
            }
        } catch(e){
            return config.ERROR['500']
        }
    },
    isValidJSON(str){
        if( typeof( str ) !== 'string' ) { 
            return false;
        }
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    },
    download(info, fileName){
        var csvData = this.ConvertToCSV(info);
        var a = document.createElement("a");
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        var blob = new Blob([csvData], { type: 'text/csv' });
        var url= window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
    },
    ConvertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = 'Type,Status';
        str += '\r\n';
        for (var key in array) {
            var line = '';
            line = key + ',' + array[key];
            str += line + '\r\n';
        }
        return str;
    }
}