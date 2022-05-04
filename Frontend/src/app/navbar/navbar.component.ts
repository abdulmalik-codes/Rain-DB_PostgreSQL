import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  signInMode = true;
  somePlaceholder: string = 'new value';
  constructor() {}

  ngOnInit(): void {}

  onSignInMode() {
    this.signInMode = !this.signInMode;
  }
}
