import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map } from 'rxjs/operators';
import { Md5 } from 'ts-md5';
import { ROLES } from './website.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient,
  ) {
    this.isLoggedIn();
    this.checkUserAgent();
  }

  jwtHelper: JwtHelperService = new JwtHelperService();

// KeepSignIn wordt door het backend geregeld door een x tijd op te tellen bij de expdate

  login$(credentials) {
    let localData;
    // return this.http.post<string>(environment.loginUrl, credentials)
    credentials.password = <string>Md5.hashStr(credentials.password);
    return this.http.post<string>('https://www.ttvn.nl/api/signin', credentials)
      .pipe(
        map(response => {
          localData = response;
          if (localData && localData.Token) {

            // We kunnen alleen inloggen als er een rol is. Ingebouwd omdat ik andere rollen wil gebruiken voor de jeugdapp.
            const localRoles = this.jwtHelper.decodeToken(localData.Token).role;
            if (localRoles.indexOf(ROLES.BESTUUR) === -1 && localRoles.indexOf(ROLES.JC) === -1 && localRoles.indexOf(ROLES.TRAINER) === -1 &&
            localRoles.indexOf(ROLES.LEDENADMIN) === -1 && localRoles.indexOf(ROLES.PENNINGMEESTER) === -1 && localRoles.indexOf(ROLES.ADMIN) === -1 &&
            localRoles.indexOf(ROLES.TEST) === -1 ) return false;


            localStorage.removeItem('token');
            localStorage.setItem('token', localData.Token);

            return true;
          }
          return false;
        })
      );
  }

  logOff() {
    localStorage.removeItem('token');
  }

  isLoggedIn() {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    return !this.jwtHelper.isTokenExpired(token);
  }

  get userId() {
    const token = localStorage.getItem('token');
    if (!this.token) {
      return false;
    }
    const jsonToken = this.jwtHelper.decodeToken(token);
    return jsonToken.userid;
  }

  get LidNr() {
    const token = localStorage.getItem('token');
    if (!this.token) {
      return false;
    }
    const jsonToken = this.jwtHelper.decodeToken(token);
    return jsonToken.lidnr;
  }

  get fullName() {
    const token = localStorage.getItem('token');
    if (!this.token) {
      return false;
    }
    const jsonToken = this.jwtHelper.decodeToken(token);

    let name = jsonToken.firstname;
    if (jsonToken.prefix) {
      name += ' ' + jsonToken.prefix;
    }
    name += ' ' + jsonToken.lastname;
    return name;
  }

  get firstname() {
    const token = localStorage.getItem('token');
    if (!this.token) {
      return false;
    }
    const jsonToken = this.jwtHelper.decodeToken(token);
    return jsonToken.firstname;
  }

  // property roles
  get roles() {
    const token = localStorage.getItem('token');
    if (!this.token) {
      return '';
    }
    const jsonToken = this.jwtHelper.decodeToken(token);
    return jsonToken.role;
  }

  isRole(role: string): boolean {
    return this.roles.indexOf(role) !== -1
  }


  get token() {
    return localStorage.getItem('token');
  }

  /***************************************************************************************************
  / Mag de pagina in het menu worden getoond voor deze gebruiker.
  /***************************************************************************************************/
  showRoute(allowRoles: string[]): boolean {
    for (let i = 0; i <= allowRoles.length; i++) {
      if (this.roles.indexOf(allowRoles[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

/***************************************************************************************************
/ Onderstaande code heb ik een keer gevonden toen ik met de install knop bezig was op mobile deivces.
/ Kan nog wel eens van pas komen om uit te zoeken op welk device je actief bent.
/***************************************************************************************************/

  promptIntercepted = false;
  isStandalone = false;
  deferredPrompt;
  userInstalled = false;
  whereIsShare = 'bottom';

  // user agent
  isChrome = false;
  isExplorer = false;
  isExplorer_11 = false;
  isFirefox = false;
  isSafari = false;
  isOpera = false;
  isEdgeDesktop = false;
  isEdgeiOS = false;
  isEdgeAndroid = false;
  userAgent = '';

  isIOS = false;
  isMobile = false;

  // For testing debug display only
  promptSaved = false;
  customButtonClicked = false;
  deferredPromptShown = false;
  deferredPromptRejected = false;

  checkUserAgent() {
    this.userAgent = navigator.userAgent.toLowerCase();
    const uaString = this.userAgent;

    this.isChrome = /chrome/.test(uaString);
    this.isExplorer = /msie/.test(uaString);
    this.isExplorer_11 = /rv:11/.test(uaString);
    this.isFirefox  = /firefox/.test(uaString);
    this.isSafari = /safari/.test(uaString);
    this.isOpera = /opr/.test(uaString);
    this.isEdgeDesktop = /edge/.test(uaString);
    this.isEdgeiOS = /edgios/.test(uaString);
    this.isEdgeAndroid = /edga/.test(uaString);

    this.isIOS = /ipad|iphone|ipod/.test(uaString);
    this.isMobile = /mobile/.test(uaString);
    if ((this.isChrome) && (this.isSafari)) { this.isSafari = false; }
    if ((this.isChrome) && (  (this.isEdgeDesktop) ||
                              (this.isEdgeiOS) ||
                              (this.isEdgeAndroid) )  ) { this.isChrome = false; }
    if ((this.isSafari) && (  (this.isEdgeDesktop) ||
                              (this.isEdgeiOS) ||
                              (this.isEdgeAndroid) )  ) { this.isSafari = false; }
    if ((this.isChrome) && (this.isOpera)) { this.isChrome = false; }

    if (/ipad/.test(uaString)) {
      this.whereIsShare = 'top';
    }
    if ( window.matchMedia('(display-mode: standalone)').matches ) {
      this.isStandalone = true;
    }
  }

  trackInstalled () {
    // called from listener in app.component
    // this.gas.emitEvent('A2HS', 'Installed', '' , 0);
    console.log('setting this.userInstalled true');
    this.userInstalled = true;
  }

  addToHomeScreen () {
    // call on custom button click
    this.customButtonClicked = true;

    if (!this.deferredPrompt) {
      console.log('deferredPrompt null');
      return;
    }

    // Show the prompt
    this.deferredPrompt.prompt();
    this.deferredPromptShown = true;

    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult) => {

        if (choiceResult.outcome === 'accepted') {
            // no matter the outcome, the prompt cannot be reused ON MOBILE
            // for 3 months or until browser cache is cleared?
        } else {
            this.deferredPromptRejected = true;
        }

      });
  }

  showHide(checkWhat: boolean) {
    if (checkWhat) {
      return 'block';
    } else {
      return 'none';
    }
  }

  browserPromptBtn() {
    if (this.promptIntercepted && !this.userInstalled ) {
      return 'block';
    } else {
      return 'none';
    }
  }

  iOSSafariHow2() {
    if (this.isSafari && this.isIOS && !this.isStandalone ) {
      return 'block';
    } else {
      return 'none';
    }
  }


  showHideButton_iOS() {
    if (this.isIOS && !this.userInstalled) {
      return 'block';
    } else {
      return 'none';
    }
  }

  trueOrFalse(checkWhat: boolean) {
    if (checkWhat) {
      return 'green';
    } else {
      return 'red';
    }
  }












}
