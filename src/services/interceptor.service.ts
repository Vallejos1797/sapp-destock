import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {MainService} from './main.service';


@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  get token(): string{
    console.log(this.Main.getSession());
    return (this.Main.getSession() || {}).token;
  }

  constructor( private Main: MainService) { }

  intercept( req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const headers = new HttpHeaders({
      'Authorization':`Bearer ${this.token}`,
    })

    const reqClone = req.clone({
      headers
    })
    return next.handle( reqClone );
  }

}
