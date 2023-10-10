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
  shorturlSuccess = false;
  updatedDate: any;
  isCopied: boolean = false;

  constructor(private apiService: ApiService, private formBuilder: FormBuilder) { }

  onSubmit(): void {
    console.log( this.checkoutForm.value.longUrl);
    this.isCopied = false;
    this.apiService.getUrlDetails(this.checkoutForm.value.longUrl).subscribe({
      next: (response) => {
        this.apiResponse = response;
        console.log('Received API Response:', this.apiResponse);
      },
      error: (error) => {
        console.log(error);
        this.shorturlErr = error;
        this.shorturlSuccess = false;
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
      },

    });
  }

  openNewTab() {
    window.open(`https://${this.shortUrl}`, '_blank');
  }
  
  copyUrl(){
    navigator.clipboard.writeText(`https://${this.shortUrl}`);
    this.isCopied = true;
  }
  goBack (){
    this.checkoutForm.reset();
    this.shorturlSuccess = !this.shorturlSuccess;
  }
}
