import { NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadService } from './load.service';

@Component({
  selector: 'app-load',
  standalone: true,
  imports: [NgIf],
  templateUrl: './load.component.html',
  styleUrl: './load.component.css'
})
export class LoadComponent implements OnChanges {
  @Input() isLoad:boolean = false
  ngOnChanges(changes: SimpleChanges): void {
    if ('isLoad' in changes) {
      this.isLoad = changes['isLoad'].currentValue;
    }
  }
}
