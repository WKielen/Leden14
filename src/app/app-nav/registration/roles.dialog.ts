import { Component, OnInit } from '@angular/core';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
import { BaseComponent } from 'src/app/shared/base.component';
import { Page, Role, WebsiteService } from 'src/app/services/website.service';


@Component({
    selector: 'app-roles-dialog',
    templateUrl: './roles.dialog.html',
})
export class RolesDialogComponent extends BaseComponent implements OnInit {

    constructor(
        public websiteService: WebsiteService
    ) { super() }

    public pages: Array<Page> = [];
    public roles: Array<Role> = [];

    public toPrintDict: Dictionary = new Dictionary([]);
    public rolesList: Section[] = []; // for the html

    ngOnInit(): void {
        this.roles = this.websiteService.getRoles();
        this.pages = this.websiteService.getPages();
        this.getPagesPerRoles();
        this.fillDisplayList();
    }

    /***************************************************************************************************
    /
    /***************************************************************************************************/
    private getPagesPerRoles(): void {
        this.roles.forEach(role => {
          let pagesToDisplay: Array<string> = [];
          this.pages.forEach(page => {
            if (page.DisplayOnRoles.includes(role.Code)) {
              pagesToDisplay.push(page.MenuDisplayValue);
            }
          });
          this.toPrintDict.add(role.DisplayValue,pagesToDisplay)
        });
    }

    /***************************************************************************************************
    /
    /***************************************************************************************************/
    private fillDisplayList(): void {
        for (let i = 0; i < this.toPrintDict.length(); i++) {
            let section: Section = Object();
            section.header = this.toPrintDict.keys()[i];
            section.pages = this.toPrintDict.values[i].toString().split(',').join(', ');
            this.rolesList.push(section); // add section to list
        }
    }
}

export interface Section {
    header: string;
    pages: string;
}
