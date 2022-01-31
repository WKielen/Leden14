import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF, LocationStrategy, HashLocationStrategy, registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AdminAuthGuard } from './services/admin-auth-guard.service';
import { AgendaService } from './services/agenda.service';
import { AuthGuard } from './services/auth.guard';
import { AuthService } from './services/auth.service';
import { LedenService } from './services/leden.service';
import { MailService } from './services/mail.service';
import { NotificationService } from './services/notification.service';
import { ParamService } from './services/param.service';
import { ReadTextFileService } from './services/readtextfile.service';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { TrainingService } from './services/training.service';
import { UserService } from './services/user.service';
import { WebsiteService } from './services/website.service';
import { BaseComponent } from './shared/base.component';
import { AppErrorHandler } from './shared/error-handling/app-error-handler';
import { ParentComponent } from './shared/parent.component';
import { AppNavModule } from './app-nav/app-nav.module';
import { MyPagesModule } from './my-pages/my-pages.module';
import localeNl from '@angular/common/locales/nl';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { WimsLibModule } from 'wims-lib';

registerLocaleData(localeNl);
@NgModule({
  declarations: [
    AppComponent,
    ParentComponent,
    BaseComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppNavModule,
    MyPagesModule,
    WimsLibModule.forRoot({ apiUrl: environment.baseUrl }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserAnimationsModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    AdminAuthGuard,
    LedenService,
    ReadTextFileService,
    {
      provide: APP_BASE_HREF,
      useValue: '/'
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    AgendaService,
    ParamService,
    MailService,
    TrainingService,
    UserService,
    WebsiteService,
    NotificationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler
    },

    {
      provide: LOCALE_ID,
      useValue: 'nl'
    },
    { provide: MAT_DATE_LOCALE, useValue: 'nl-NL' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
