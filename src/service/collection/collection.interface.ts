import {Observable} from 'rxjs/Observable';
import {WpPagination} from "./collection.service";

export interface CollectionInterface {

  get(args?): Observable<any>;
  more(): Observable<CollectionResponse>;
  next(): Observable<CollectionResponse>;
  prev(): Observable<CollectionResponse>;
}

export interface CollectionResponse {
  data: any;
  pagination: WpPagination;
  error: any;
}
