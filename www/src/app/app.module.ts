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

@NgModule({
  declarations: [
    AppComponent,
    OneComponent,
    TwoComponent,
    MetamaskComponent,
    PortisComponent,
    ThreeComponent,
    FourComponent,
    BlockchainStatusComponent
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
