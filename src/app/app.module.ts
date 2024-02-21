import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(),DatePipe
  ],
})
export class AppModule { }
