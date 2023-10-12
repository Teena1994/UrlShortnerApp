import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { FormBuilder } from '@angular/forms';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  checkoutForm = this.formBuilder.group({
    longUrl: '',
  });
  apiResponse: any;
  shortUrl ='';
  shorturlErr = '';
  redirectUrlData:any;
  shorturlSuccess = false;
  updatedDate: any;
  isCopied: boolean = false;
  isLoading: boolean = false;

  constructor(private apiService: ApiService, private formBuilder: FormBuilder) { }

  onSubmit(): void {
    this.isCopied = false;
    this.isLoading = true;
    this.apiService.getUrlDetails(this.checkoutForm.value.longUrl).subscribe({
      next: (response) => {
        this.apiResponse = response;
        console.log('Received API Response:', this.apiResponse);
      },
      error: (error) => {
        console.log(error);
        this.shorturlErr = error;
        this.shorturlSuccess = false;
        this.isLoading = false;
        window.alert( JSON.stringify(this.shorturlErr));
      },
      complete: () => {
        this.shortUrl = this.apiResponse.shortUrl;
        if(this.apiResponse.updatedDate !== 'just now'){
        this.updatedDate = formatDistanceToNow(new Date(this.apiResponse.updatedDate), { addSuffix: true });
        }else{
          this.updatedDate = this.apiResponse.updatedDate;
        }
        this.shorturlSuccess = true;
        this.checkoutForm.value.longUrl = "";
        this.isLoading = false;
      },

    });
  }
  
  copyUrl(){
    navigator.clipboard.writeText(`${this.shortUrl}`);
    this.isCopied = true;
  }
  goBack (){
    this.checkoutForm.reset();
    this.shorturlSuccess = !this.shorturlSuccess;
  }

  openNewTab (){
    this.isLoading = true;

    this.apiService.redirectUrl(this.shortUrl).subscribe({
      next: (response) => {
        console.log('Received redirect URL Response:', response);
        this.redirectUrlData = response;
      },
      error: (error) => {
        console.log(error);
        this.shorturlErr = error;
        this.shorturlSuccess = false;
        this.isLoading = false;
        window.alert( JSON.stringify(this.shorturlErr));
      },
      complete: () => {
        console.log('redirect API call completed.');
        window.open(`${ this.redirectUrlData.orginalUrl}`, '_blank');
        this.isLoading = false;
      }
    });     
  }
}

