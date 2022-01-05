import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { Page, Role, WebsiteService } from 'src/app/services/website.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent extends BaseComponent implements OnInit {

  // We gebruiken de 'isHandset' om te bepalen of het een mobiel is. Als het een mobiel is dan
  // sluiten we het menu direct nadat er een menu-item is gekozen.
  @Input() isHandset: boolean;

  // Deze output wordt gebruikt om in de default component het menu te sluiten.
  @Output() displaySideBar: EventEmitter<any> = new EventEmitter();

  // Wordt gebruikt om de naam te tonen bovenaan het menu
  public name: string = this.authService.firstname;
  public pages: Array<Page> = [];
  public pagesToShow: Array<Page> = [];
  public roles: Array<Role> = [];

  constructor(
    private authService: AuthService,
    private websiteService: WebsiteService,
    private router: Router,

  ) { super() }

  ngOnInit() {
    /***************************************************************************************************
    / Aan de hand van de rollen van de ingelogde gebruiker en de rollen die een pagina mogen zien, ga
    / ik kijken welke pagina's deze gebruiker mag zien.
    / Een * bij de pagina betekent dat alle gebruikers die pagina mogen zien.
    /***************************************************************************************************/
    this.pages = this.websiteService.getPages();
    let rollenUser: string = this.authService.roles;

    for (let i = 0; i < this.pages.length; i++) {
      let displayThisOne: boolean = false;
      const page = this.pages[i];
      if (page.DisplayOnRoles == '*')
        displayThisOne = true;
      let roleListPage: Array<string> = page.DisplayOnRoles.split(',');
      for (let j = 0; j < roleListPage.length; j++) {
        if (rollenUser.includes(roleListPage[j])) {
          displayThisOne = true;
          break;
        }
      }
      if (displayThisOne)
        this.pagesToShow.push(this.pages[i])
    }
    // Okay, this.pagesToShow bevat alle pagina's die de gebruiker mag zien.

  }
  // Op de mobiel wordt het menu automatisch gesloten wanneer en een keuze is gemaakt.
  route(myRoute: string): void {
    this.router.navigate([myRoute as any]);
    if (this.isHandset) {
      this.displaySideBar.emit(false);
    }
  }

}
