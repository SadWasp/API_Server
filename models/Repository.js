
const fs = require('fs');
///////////////////////////////////////////////////////////////////////////
// This class provide CRUD operations on JSON objects collection text file 
// with the assumption that each object have an Id member.
// If the objectsFile does not exist it will be created on demand.
// Warning: no type and data validation is provided
///////////////////////////////////////////////////////////////////////////
module.exports = 
class Repository {
    constructor(objectsName) {
        this.objectsList = [];
        this.objectsFile = `./data/${objectsName}.json`;
        this.read();
    }
    read() {
        try{
            // Here we use the synchronus version readFile in order  
            // to avoid concurrency problems
            let rawdata = fs.readFileSync(this.objectsFile);
            // we assume here that the json data is formatted correctly
            this.objectsList = JSON.parse(rawdata);
        } catch(error) {
            if (error.code === 'ENOENT') {
                // file does not exist, it will be created on demand
                this.objectsList = [];
            }
        }
    }
    write() {
        // Here we use the synchronus version writeFile in order
        // to avoid concurrency problems  
        fs.writeFileSync(this.objectsFile, JSON.stringify(this.objectsList));
        this.read();
    }
    nextId() {
        let maxId = 0;
        for(let object of this.objectsList){
            if (object.Id > maxId) {
                maxId = object.Id;
            }
        }
        return maxId + 1;
    }
    add(object) {
        try {
            object.Id = this.nextId();
            this.objectsList.push(object);
            this.write();
            return object;
        } catch(error) {
            return null;
        }
    }
    getAll() {
        return this.objectsList;
    }
    get(id){
        for(let object of this.objectsList){
            if (object.Id === id) {
               return object;
            }
        }
        return null;
    }
    remove(id) {
        let index = 0;
        for(let object of this.objectsList){
            if (object.Id === id) {
                this.objectsList.splice(index,1);
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    update(objectToModify) {
        let index = 0;
        for(let object of this.objectsList){
            if (object.Id === objectToModify.Id) {
                this.objectsList[index] = objectToModify;
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    sort(bookmarks, params) {

        if(params['sort'] == "name") {
            bookmarks.sort(this.ascending);
        } else if(params['sort'] == "category") {
            bookmarks.sort(this.ascending);
        }
        return bookmarks;
    }
    FindName(bookmarks, params) {
        let arr = []
        if(params['name'][params['name'].length-1] === '*') {

            let nameToFind = params['name'].split('*')[0];
            for(let i = 0; i < bookmarks.length; i++) {
                if(bookmarks[i].Name.startsWith(nameToFind)) {
                    arr.push(bookmarks[i]);
                }
            }
        } else {
            for(let i = 0; i < bookmarks.length; i++) {
                if(bookmarks[i].Name === params['name']) {
                    arr.push(bookmarks[i]);
                }
            }
        }
        return arr;
    }
    FindCategory(bookmarks, params) {
        let arr = []
        for(let i = 0; i < bookmarks.length; i++) {
            if(bookmarks[i].Category === params['category']) {
                arr.push(bookmarks[i]);
            }
        }
        return arr;
    }

    ascending(a, b ) {
        if ( a.Name < b.Name ){
          return -1;
        }
        if ( a.Name > b.Name ){
          return 1;
        }
        return 0;
    }
    descending(a, b ) {
        if ( a.Name < b.Name ){
          return 1;
        }
        if ( a.Name > b.Name ){
          return -1;
        }
        return 0;
    }

}