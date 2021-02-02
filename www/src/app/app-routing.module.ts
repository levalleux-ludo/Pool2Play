import { RpsGamePageComponent } from './_components/rps-game-page/rps-game-page.component';
import { MinerComponent } from './_components/miner/miner.component';
import { FourComponent } from './_components/four/four.component';
import { ThreeComponent } from './_components/three/three.component';
import { TwoGuard } from './_helpers/two-guard';
import { TwoComponent } from './_components/two/two.component';
import { OneComponent } from './_components/one/one.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '1', component: OneComponent, data: { network: 'ganache'}  },
  // { path: '1', component: OneComponent, data: { network: 'goerli'}  },
  // { path: '1', component: OneComponent, data: { network: 'bscTest'}  },
  { path: '2', component: TwoComponent, data: { network: 'ganache'} },
  // { path: '2', component: TwoComponent, data: { network: 'maticMumbai'} },
  // { path: '2', component: TwoComponent, data: { network: 'bscTest'} },
  { path: 'miner', component: MinerComponent },
  { path: 'game', component: RpsGamePageComponent, data: { network: 'ganache'} },
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
