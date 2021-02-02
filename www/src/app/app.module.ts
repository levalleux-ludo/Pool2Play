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
import {MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatButtonModule} from '@angular/material/button';




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
import { RpsGameItemComponent } from './_components/rps-game-item/rps-game-item.component';
import { RpsGamePageComponent } from './_components/rps-game-page/rps-game-page.component';
import { PlayerCardComponent } from './_components/player-card/player-card.component';
import { RpsChoicesComponent } from './_components/rps-choices/rps-choices.component';
import { RoundEndedDialogComponent } from './_components/round-ended-dialog/round-ended-dialog.component';
import { ShortAddressComponent } from './_components/short-address/short-address.component';

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
    RegisteringComponent,
    RpsGameItemComponent,
    RpsGamePageComponent,
    PlayerCardComponent,
    RpsChoicesComponent,
    RoundEndedDialogComponent,
    ShortAddressComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ClarityModule,
    FlexLayoutModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    ClipboardModule,
    MatButtonModule
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
