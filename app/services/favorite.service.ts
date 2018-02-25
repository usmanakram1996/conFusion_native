import {Injectable} from '@angular/core';
import {Dish} from '../shared/dish';
import {DishService} from '../services/dish.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {CouchbaseService} from './couchbase.service';

@Injectable()

export class FavoriteService {
    favorites: Array<number>;
    docId: string = "favorites";

    constructor( private dishservice:DishService,
        private couchbaseservice:CouchbaseService){
       
        this.favorites =[];

        let doc = this.couchbaseservice.getDocument(this.docId); 
        if(doc == null){
            this.couchbaseservice.createDocument({"favorites": []}, this.docId);   
        } else {
            this.favorites = doc.favorites;

        }

    }

    isFavorite(id:number): boolean{
        return this.favorites.some(el => el === id);
    }

    addFavorite(id:number): boolean{

        if(!this.isFavorite(id)){
            this.favorites.push(id);
            this.couchbaseservice.updateDocument(this.docId, {"favorites": this.favorites });
        }
        
        return true;
    }

    getFavorites(): Observable<Dish[]>{
        return this.dishservice.getDishes()
            .map(dishes => dishes.filter(dish => this.favorites.some(el => el === dish.id)));
    }

    deleteFavorite(id: number): Observable<Dish[]> {
        let index = this.favorites.indexOf(id);
        if(index >= 0){
            this.favorites.splice(index,1);
            this.couchbaseservice.updateDocument(this.docId, {"favorites": this.favorites });
            return this.getFavorites();
        }
        else{
            return Observable.throw('Deleting non-existant favorite');
        }
    }   


}