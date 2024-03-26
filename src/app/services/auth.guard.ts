import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ROUTE } from './website.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if (!!this.authService.isLoggedIn()) {
        return true;
      } else {
        this.router.navigate([ROUTE.loginPageRoute], {queryParams: {returnUrl: state.url}} ); // Query params -> als je specifieke pag opgeeft dan gaat deze pag mee naar de login pag en naar login wordt er direct naar deze pag doorgerouteerd
      }
    return false;
  }
}
