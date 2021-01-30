import { PortisService } from './../_services/portis.service';
import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TwoGuard {
  constructor(
    private portis: PortisService
  ) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return new Promise<boolean>((resolve, reject) => {
      this.portis.login(route.data.network).then(({account, provider}) => {
        resolve(true);
      }).catch(e => {
        console.error(e);
        resolve(false);
      })
    });
  }
}
