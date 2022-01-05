import { AppError } from '../shared/error-handling/app-error';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, retry } from 'rxjs/operators';
import { throwError as observableThrowError, Subscription,  Observable } from 'rxjs';
import { NotFoundError } from '../shared/error-handling/not-found-error';
import { DuplicateKeyError } from '../shared/error-handling/duplicate-key-error';
import { NoChangesMadeError } from '../shared/error-handling/no-changes-made-error';
import { ServiceUnavailableError } from '../shared/error-handling/service-unavailable-error';
import { Directive, OnDestroy } from '@angular/core';

@Directive()  // Toegevoegd bij migratie naar 11
export class DataService implements OnDestroy {

  private observableSubscriptions = new Array<Subscription>();

  constructor(protected url: string,
    protected http: HttpClient) { }

  getAll$() {
    return this.http.get(this.url + '/GetAll')
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        catchError(this.errorHandler)
      );
  }

  update$(resource: any) {
    // console.log('received in update$', resource);
    return this.http.patch(this.url + '/Update', resource)
      .pipe(
        retry(1),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        catchError(this.errorHandler)
      );
  }

  public create$(resource: any) {
    return this.http.post(this.url + '/Insert', resource)
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        catchError(this.errorHandler)
      );
  }

  delete$(id:string) {
    return this.http.delete(this.url + '/Delete?Id=' + '"' + id + '"')
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        catchError(this.errorHandler)
      );
  }

  protected errorHandler(error: HttpErrorResponse) {

    if (error.status === 404) {
      return observableThrowError(() => new NotFoundError());
    }

    if (error.status === 409) {
      return observableThrowError(() => new DuplicateKeyError());
    }

    if (error.status === 422) {
      return observableThrowError(() => new NoChangesMadeError());
    }

    if (error.status === 503) {
      return observableThrowError(() => new ServiceUnavailableError());
    }

    return observableThrowError(() => new AppError(error));
  }


/***************************************************************************************************
/ When dealing with RxJs Observables and Subscriptions, it can easily happen, that you leak some memory.
/ That is because your component is destroyed, but the function you registered inside of the observable
/ is not. That way, you not only leak memory but probably also encounter some odd behavior.
/***************************************************************************************************/
public registerSubscription(subscription: Subscription): void {
  this.observableSubscriptions.push(subscription);
}

/***************************************************************************************************
/ To prevent memory leajs, make sure to unsubscribe from your subscriptions, when the component is destroyed.
/ One good place to do so, would be the ngOnDestroy lifecycle hook.
/***************************************************************************************************/
  ngOnDestroy() {
    for (let subscription of this.observableSubscriptions) {
      subscription.unsubscribe();
      console.log('kill subscriptions in service');
    }
  }
}
