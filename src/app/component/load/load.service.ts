import { Injectable } from '@angular/core';

@Injectable()
export class LoadService {
  private isLoad: boolean = false;

  onLoad(): void {
    this.isLoad = true;
  }

  offLoad(): void {
    this.isLoad = false;
  }

  getIsLoad(): boolean {
    return this.isLoad;
  }
}