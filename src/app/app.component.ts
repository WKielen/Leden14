import { Component } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    public authServer: AuthService,
    public swUpdate: SwUpdate,
    protected snackBar: MatSnackBar,
  ) {

    if (swUpdate.isEnabled) {
      swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map(evt => ({
          type: 'UPDATE_AVAILABLE',
          current: evt.currentVersion,
          available: evt.latestVersion,
        }))).subscribe({
          next: ((evt: any) => {
            console.log('%cUPDATE AVAILABLE new version: ', 'color: #ec6969; font-weight: bold;');
            if (confirm('Update beschikbaar, pagina opnieuw laden?'))
              swUpdate.activateUpdate().then(() => document.location.reload());
          })
        })
    }
    /***************************************************************************************************
    / check out in what browser we are etc.
    /***************************************************************************************************/
    authServer.checkUserAgent();

    /***************************************************************************************************
    / Do not ask to install on older browsers
    /***************************************************************************************************/
    window.addEventListener('beforeinstallprompt', (e) => {

      // show the add button
      authServer.promptIntercepted = true;
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      // no matter what, the snack-bar shows in 68 (06/16/2018 11:05 AM)
      e.preventDefault();
      // Stash the event so it can be displayed when the user wants.
      authServer.deferredPrompt = e;
      authServer.promptSaved = true;

    });

    // we ware installed.
    window.addEventListener('appinstalled', (evt) => {
      authServer.trackInstalled();
      // hide the add button
      // authServer.promptIntercepted = false;
    });
  }

}
