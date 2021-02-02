import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface RoundEndedDialogData {
  indexRound: number;
  nbRounds: number;
  myIndex: number;
  choices: number[];
  scores: number[];
  youwin: boolean;
  youlost: boolean;
}

@Component({
  selector: 'app-round-ended-dialog',
  templateUrl: './round-ended-dialog.component.html',
  styleUrls: ['./round-ended-dialog.component.scss']
})
export class RoundEndedDialogComponent implements OnInit {

  Choices = [
    'Rock',
    'Paper',
    'Scissors'
  ];

  Images = [
    'assets/rock.png',
    'assets/paper.png',
    'assets/scissors.png'
  ];

  public static showModal(dialog: MatDialog, data: RoundEndedDialogData): Promise<any> {
    const dialogRef = dialog.open(RoundEndedDialogComponent, {
      width: '350px',
      // height: '80%',
      disableClose: false,
      data
    });
    return new Promise((resolve, reject) => {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('The RoundEndedDialogComponent dialog was closed', result);
          resolve(result);
        } else {
          reject(undefined);
        }
      }, error => {
        reject(error);
      });
    });
  }

  constructor(
    public dialogRef: MatDialogRef<RoundEndedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoundEndedDialogData
  ) { }

  ngOnInit(): void {
  }

}
