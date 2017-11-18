
export const config = {
    //baseUrl:'http://136.225.202.95:8080',
    baseUrl: 'http://localhost:3000',
    //baseFolderURL:'release/',
    baseFolderURL:'/',
    releasecontentURL:'releasecontent',
    releasecalendarURL:'releasecalendar',
    getReleaseCalendarURL:'/calendar',
    addReleaseURL:'/calendar',
    releaseTypeURL:'/config/releaseType',
    dropURL:'/config/drop',
    deleteURL:'/calendar/delete',
    updateReleaseURL:'/calendar',
    releaseURL:'/config/releases',
    releaseDataURL:'/content',
    addReleaseDataURL: '/content',
    updateReleaseDataURL:'/content',
    deleteContentURL:'/content/delete',
    taskType: '/config/taskType',
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
        500:"INTERNAL SEREVER ERROR"
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
    }
}