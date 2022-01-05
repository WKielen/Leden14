import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ROUTE } from './website.service';

@Injectable({
  providedIn: 'root'
})

export class AdminAuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const roles = route.data['roles'] as Array<string>;   // ['AD', 'XX']
    const userRoles =  this.authService.roles.split(',');  //  AD, YY

    for (let i = 0; i < roles.length; i++) {
      if (userRoles.indexOf(roles[i]) !== -1) {
        return true;
      }
    }

    this.router.navigate([ROUTE.notAllowedPageRoute]);
    return false;
  }
}
