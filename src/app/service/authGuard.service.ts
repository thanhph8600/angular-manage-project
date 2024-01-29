// role.guard.ts
import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './user/user.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    @Inject(UserService) private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const expectedRole = this.resolveExpectedRole(next.data['expectedRole'], next); 
    
    if (!this.userService.hasRole(expectedRole)) {
      this.router.navigate(['/404-not-fond']);
      return false;
    }
    
    return true;
  }

  private resolveExpectedRole(expectedRole: Array<String> | Function, route: ActivatedRouteSnapshot): Array<String> {
    if (typeof expectedRole === 'function') {
      // If expectedRole is a function, call it passing the route
      return expectedRole(route);
    }

    return expectedRole;
  }
}

