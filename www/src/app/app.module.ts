import Web3 from 'web3';
import { EthService } from './_services/eth.service';
import { WindowRef } from './_helpers/WindowRef';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatProgressBarModule} from '@angular/material/progress-bar';




import { OneComponent } from './_components/one/one.component';
import { TwoComponent } from './_components/two/two.component';
import { WEB3 } from './_helpers/tokens';
import { MetamaskComponent } from './_components/metamask/metamask.component';
import { PortisComponent } from './_components/portis/portis.component';
import { ThreeComponent } from './_components/three/three.component';
import { FourComponent } from './_components/four/four.component';
import { BlockchainStatusComponent } from './_components/blockchain-status/blockchain-status.component';
import { AtokenComponent } from './_components/atoken/atoken.component';
import { BalanceComponent } from './_components/balance/balance.component';
import { MinerComponent } from './_components/miner/miner.component';
import { GameMasterComponent } from './_components/gamemaster/gamemaster.component';
import { TellorComponent } from './_components/tellor/tellor.component';
import { SubscriptionCheckerComponent } from './_components/subscription-checker/subscription-checker.component';
import { RegisteringComponent } from './_components/registering/registering.component';

@NgModule({
  declarations: [
    AppComponent,
    OneComponent,
    TwoComponent,
    MetamaskComponent,
    PortisComponent,
    ThreeComponent,
    FourComponent,
    BlockchainStatusComponent,
    AtokenComponent,
    BalanceComponent,
    MinerComponent,
    GameMasterComponent,
    TellorComponent,
    SubscriptionCheckerComponent,
    RegisteringComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ClarityModule,
    FlexLayoutModule,
    MatProgressBarModule
  ],
  providers: [
    WindowRef,
    EthService,
    {
      provide: WEB3,
      useFactory: () => new Web3(Web3.givenProvider)
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
