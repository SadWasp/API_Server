const Repository = require('../models/Repository');

module.exports = 
class BookmarksController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.bookmarksRepository = new Repository('Bookmarks');
    }
    getAll(){
        
        let params = this.getQueryStringParams();
        
        if(params != null && Object.keys(params).length > 0) {

            let bookmarks = this.bookmarksRepository.getAll();
            
            if ('sort' in params) {
                bookmarks = this.bookmarksRepository.sort(bookmarks, params);
            }
            if('name' in params) {
                bookmarks = this.bookmarksRepository.FindName(bookmarks, params);
            }
            if('category' in params) {
                bookmarks = this.bookmarksRepository.FindCategory(bookmarks, params);
            } 
            this.response.JSON(bookmarks);
        }
        
        else if (params != null && Object.keys(params).length === 0) {
            this.help(); 
        }
        
        else 
            this.response.JSON(this.bookmarksRepository.getAll());
    }
    get(id){
         if(!isNaN(id)) {
            this.response.JSON(this.bookmarksRepository.get(id));
        }
        else
            this.getAll();
    }
    post(bookmark){  
        if (bookmark) {
            if(this.validateBookmark(bookmark)) {
                let newBookmark = this.bookmarksRepository.add(bookmark);
                this.response.created(JSON.stringify(newBookmark));
            }
        }
        else
            this.response.internalError();
    }
    put(bookmark){
        if(this.validateBookmark(bookmark)) {
            if (this.bookmarksRepository.update(bookmark))
                this.response.ok();
            else 
                this.response.notFound();
        } else 
        this.response.internalError();
        
    }
    remove(id){
        if (this.bookmarksRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
    
    help() {
        let content = "<div style=font-family:arial>";
        content += "<h3>GET : bookmarks endpoint  <br> liste des parametres supportes:</h3><hr>";
        content += "<h4>GET: /api/bookmarks voir tous les bookmarks</h4>";
        content += "<h4>GET: /api/bookmarks?sort=name voir tous les bookmarks tries ascendant par Name </h4>";
        content += "<h4>GET: /api/bookmarks?sort=category voir tous les bookmarks tries ascendant par Category</h4>";
        content += "<h4>GET: /api/bookmarks/id voir le bookmark Id </h4>";
        content += "<h4>GET: /api/bookmarks?name=nom voir le bookmark avec Name = nom </h4>";
        content += "<h4>GET: /api/bookmarks?name=ab* voir tous les bookmarks avec Name commencant par ab </h4>";
        content += "<h4>GET: /api/bookmarks?category=sport voir tous les bookmarks avec Category = sport </h4>";
        content += "<h4>GET: /api/bookmarks? Voir la liste des parametres supportes </h4>";
        content += "<h4>POST: /api/bookmarks Ajout d'un bookmark </h4>";
        content += "<h4>PUT: /api/bookmarks/Id Modifier le bookmark Id </h4>";
        content += "<h4>DELETE: /api/bookmarks/Id Effacer le bookmark Id </h4>";
        this.response.HTML(content);
    }

    validURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ 
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
            '(\\#[-a-z\\d_]*)?$','i'); 
        return pattern.test(str);
    }
    validateBookmark(bookmark) {
        let bookmarksLst = this.bookmarksRepository.getAll();
        //doublons de Name
        for(let i = 0; i< bookmarksLst.length; i++) {
            if(bookmark.Name === bookmarksLst[i].Name && bookmark.Id != bookmarksLst[i].Id) {
                return false;
            }
        }
        //champs vides
        if(bookmark.Name === " " || bookmark.Url === " " || bookmark.Category === " ") {
            return false;
        }
        //url invalides.
        if(!this.validURL(bookmark.Url)) {
            return false;
        }
        return true;
    }
}