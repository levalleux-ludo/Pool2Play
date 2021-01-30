import { FourComponent } from './_components/four/four.component';
import { ThreeComponent } from './_components/three/three.component';
import { TwoGuard } from './_helpers/two-guard';
import { TwoComponent } from './_components/two/two.component';
import { OneComponent } from './_components/one/one.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '1', component: OneComponent, data: { network: 'goerli'}  },
  { path: '2', component: TwoComponent, data: { network: 'matic'} },
  // { path: '3', component: ThreeComponent, data: { network: 'goerli'}  },
  // { path: '4', component: ThreeComponent, data: { network: 'matic'} },
  { path: '**', redirectTo: '/1' },
  // { path: '', redirectTo: '/1' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
