import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, map, throwError } from 'rxjs';
import { ROUTE } from './website.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService
    , private router: Router
  ) { }

  intercept(req, next) {

    if (!navigator.onLine) {
      this.router.navigate(['/offline']);
      return [];
    }

    let tokenizedReq;
    if (this.authService.isLoggedIn()) {
      tokenizedReq = req.clone({
        // setHeaders: {
        //   'Authorization': 'Bearer ' + this.authService.token
        // , 'Content-Type' : 'application/json'
        // , 'Accept': 'application/json'
        // }
        headers: req.headers.set('Authorization', 'Bearer ' + this.authService.token)
        // headers: req.headers.set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MTA0NzQ3NDUsImlzcyI6ImxvY2FsaG9zdCIsImV4cCI6MTYxMDU2MTE0NSwidXNlcmlkIjoiMzE5ODA0OCIsImRhdGFiYXNlIjoidHRlc3QiLCJyb2xlIjoiQlMsVEUsQUQiLCJmaXJzdG5hbWUiOiJXaW0iLCJsYXN0bmFtZSI6IktpZWxlbiIsImxpZG5yIjoiMjMifQ.5QehXnPq8PW4bmD-b-yj1_Y9SWQJxMSiWcgQPxvJPgk')
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
      });
    } else { // Als we niet ingelogd zijn dan ook het token niet meesturen.
      tokenizedReq = req.clone({
        headers: req.headers.set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .set('Database', environment.databaseName)
      });
    }
    return next.handle(tokenizedReq)
      .pipe(
        catchError((error) =>{
          if (error.status == 499) {
            this.router.navigate([ROUTE.loginPageRoute]);
            localStorage.removeItem('token');
          }
          throw error;
        })
      )

      ;
  }
}
