import { Component } from '@angular/core';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'infopage',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent {
  title = 'Informationsseite';

  constructor(private titleService: Title) {
    this.titleService.setTitle(this.title);
  }
}
