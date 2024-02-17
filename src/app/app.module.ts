import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserModule
  ],
  providers: [
    provideHttpClient(),DatePipe
  ],
})
export class AppModule { }
