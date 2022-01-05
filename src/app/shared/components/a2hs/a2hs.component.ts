import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-a2hs',
  templateUrl: './a2hs.component.html',
  styleUrls: ['./a2hs.component.css']
})
export class A2hsComponent extends BaseComponent implements OnInit {

  constructor(public authService: AuthService) { super() }
  public myWindow: any;

  ngOnInit() {
    this.myWindow = window;
  
  }
}
