import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-ios-safari-how2',
  templateUrl: './a2hs-ios-safari-how2.html',
  styleUrls: ['./a2hs-ios-safari-how2.css']
})
export class A2hsSafariHow2 extends BaseComponent {

  constructor(public authService: AuthService) { super() }
/***************************************************************************************************
/ Deze component laat op iOS devices een popup ziet hoe ze deze app aan het homescreen moeten toevoegen
/***************************************************************************************************/

}
