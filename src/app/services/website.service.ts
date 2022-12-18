import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class WebsiteService extends DataService {

  constructor(
    http: HttpClient) {
    super(environment.baseUrl + '/website', http);
  }

  getRoles() {
    let roles: Array<Role> = [];
    roles.push({ 'Id': '0', 'DisplayValue': 'Bestuur', 'Code': ROLES.BESTUUR });
    roles.push({ 'Id': '1', 'DisplayValue': 'Jeugdcommissie', 'Code': ROLES.JC });
    roles.push({ 'Id': '2', 'DisplayValue': 'Trainer', 'Code': ROLES.TRAINER });
    roles.push({ 'Id': '6', 'DisplayValue': 'Ledenadministratie', 'Code': ROLES.LEDENADMIN });
    roles.push({ 'Id': '9', 'DisplayValue': 'Old Stars trainer', 'Code': ROLES.OLDSTARS });
    // roles.push({ 'Id': '8', 'DisplayValue': 'Jeugd-app', 'Code': ROLES.JEUGD });
    roles.push({ 'Id': '7', 'DisplayValue': 'Penningmeester', 'Code': ROLES.PENNINGMEESTER });
    roles.push({ 'Id': '5', 'DisplayValue': 'Admin', 'Code': ROLES.ADMIN });
    roles.push({ 'Id': '4', 'DisplayValue': 'Test pagina\'s', 'Code': ROLES.TEST });
    return roles;
  }

  getPages() {
    let pages: Array<Page> = [];
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Dashboard', 'DisplayOnRoles': '*', 'Url': ROUTE.dashboardPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Komende week', 'DisplayOnRoles': '*', 'Url': ROUTE.komendeweekPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Ledenlijst', 'DisplayOnRoles': PAGEROLES.ledenPageRoles.join(), 'Url': ROUTE.ledenPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Ledenbeheer', 'DisplayOnRoles': PAGEROLES.ledenmanagerPageRoles.join(), 'Url': ROUTE.ledenmanagerPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Mail', 'DisplayOnRoles': PAGEROLES.mailPageRoles.join(), 'Url': ROUTE.mailPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Agenda', 'DisplayOnRoles': PAGEROLES.agendaPageRoles.join(), 'Url': ROUTE.agendaPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Website', 'DisplayOnRoles': PAGEROLES.websitePageRoles.join(), 'Url': ROUTE.websitePageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Actielijst', 'DisplayOnRoles': PAGEROLES.todolistPageRoles.join(), 'Url': ROUTE.todolistPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Ladder', 'DisplayOnRoles': PAGEROLES.ladderPageRoles.join(), 'Url': ROUTE.ladderPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Multi Update', 'DisplayOnRoles': PAGEROLES.multiupdatePageRoles.join(), 'Url': ROUTE.multiupdatePageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Download', 'DisplayOnRoles': PAGEROLES.downloadPageRoles.join(), 'Url': ROUTE.downloadPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Contributie', 'DisplayOnRoles': PAGEROLES.contrbedragenPageRoles.join(), 'Url': ROUTE.contrbedragenPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Oud Leden', 'DisplayOnRoles': PAGEROLES.oudledenPageRoles.join(), 'Url': ROUTE.oudledenPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Gebruikersbeheer', 'DisplayOnRoles': PAGEROLES.registrationPageRoles.join(), 'Url': ROUTE.registrationPageRoute});
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Sync NTTB', 'DisplayOnRoles': PAGEROLES.syncnttbPageRoles.join(), 'Url': ROUTE.syncnttbPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Presentielijst jeugd', 'DisplayOnRoles': PAGEROLES.trainingdeelnamePageRoles.join(), 'Url': ROUTE.trainingdeelnamePageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Overzicht aanw jeugd', 'DisplayOnRoles': PAGEROLES.trainingdeelnamePageRoles.join(), 'Url': ROUTE.trainingoverzichtPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Trainingsgroepen', 'DisplayOnRoles': PAGEROLES.traininggroupsPageRoles.join(), 'Url': ROUTE.traininggroupPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Masterz spelregels', 'DisplayOnRoles': PAGEROLES.masterzPageRoles.join(), 'Url': ROUTE.masterzPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Test', 'DisplayOnRoles': PAGEROLES.testPageRoles.join(), 'Url': ROUTE.testPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Comp Admin', 'DisplayOnRoles': PAGEROLES.testPageRoles.join(), 'Url': ROUTE.compadminPageRoute });
    pages.push({ 'Id': '0', 'MenuDisplayValue': 'Kennismaken', 'DisplayOnRoles': PAGEROLES.kennismakenPageRoles.join(), 'Url': ROUTE.kennismakenPageRoute });
      // pages.push({ 'Id': '0', 'MenuDisplayValue': 'Inschrijven Evenement', 'DisplayOnRoles': PAGEROLES.testPageRoles.join(), 'Url': ROUTE.subscribeeventPageRoute });

    return pages;
  }
}
export class Role {
  Id: string = '';
  DisplayValue: string = '';
  Code: string = '';
}

export class Page {
  Id: string = '';
  MenuDisplayValue: string = '';
  DisplayOnRoles: string = '';
  Url: string = '';
}

export const ROLES = {
  BESTUUR: 'BS',
  JC: 'JC',
  TRAINER: 'TR',
  LEDENADMIN: 'LA',
  PENNINGMEESTER: 'PM',
  ADMIN: 'AD',
  TEST: 'TE',
  SENIOR: 'SE',
  JEUGD: 'JE',
  OLDSTARS: 'OS',
};

export const PAGEROLES = {
  ledenmanagerPageRoles:      [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.LEDENADMIN ],
  oudledenPageRoles:          [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.LEDENADMIN ],
  ledenPageRoles:             [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC, ROLES.TRAINER, ROLES.OLDSTARS ],
  trainingdeelnamePageRoles:  [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC, ROLES.TRAINER ],
  masterzPageRoles:           [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC, ROLES.TRAINER ],
  kennismakenPageRoles:       [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC, ROLES.TRAINER, ROLES.OLDSTARS ],
  mailPageRoles:              [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC ],
  agendaPageRoles:            [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC, ROLES.OLDSTARS ],
  websitePageRoles:           [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC ],
  downloadPageRoles:          [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC, ROLES.OLDSTARS ],
  todolistPageRoles:          [ ROLES.ADMIN, ROLES.BESTUUR, ROLES.TEST ],
  registrationPageRoles:      [ ROLES.ADMIN, ROLES.BESTUUR ],
  contrbedragenPageRoles:     [ ROLES.ADMIN, ROLES.PENNINGMEESTER ],
  multiupdatePageRoles:       [ ROLES.ADMIN, ROLES.PENNINGMEESTER, ROLES.LEDENADMIN ],
  ladderPageRoles:            [ ROLES.ADMIN, ROLES.JC ],
  syncnttbPageRoles:          [ ROLES.ADMIN, ROLES.LEDENADMIN ],
  traininggroupsPageRoles:    [ ROLES.ADMIN, ROLES.TRAINER, ROLES.JC ],
  testPageRoles:              [ ROLES.TEST ],
};

export const ROUTE = {
  dashboardPageRoute: 'dashboard',
  komendeweekPageRoute: 'komendeweek',
  ledenPageRoute: 'leden',
  ledenmanagerPageRoute: 'ledenmanager',
  mailPageRoute: 'mail',
  agendaPageRoute: 'agenda',
  websitePageRoute: 'website',
  multiupdatePageRoute: 'multiupdate',
  downloadPageRoute: 'download',
  oudledenPageRoute: 'oudleden',
  contrbedragenPageRoute: 'contrbedragen',
  ladderPageRoute: 'ladder',
  syncnttbPageRoute: 'syncnttb',
  testPageRoute: 'test',
  trainingdeelnamePageRoute: 'trainingdeelname',
  trainingoverzichtPageRoute: 'trainingoverzicht',
  offlinePageRoute: 'offline',
  notAllowedPageRoute: 'notallowed',
  loginPageRoute: 'login',
  masterzPageRoute: 'masterz',
  compadminPageRoute: 'compadmin',
  todolistPageRoute: 'todo',
  registrationPageRoute: 'registration',
  traininggroupPageRoute: 'traininggroups',
  subscribeeventPageRoute: 'inschrijven',
  kennismakenPageRoute: 'kennismaken',
};
