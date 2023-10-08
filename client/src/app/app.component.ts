import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  checkoutForm = this.formBuilder.group({
    longUrl: '',
    shortUrl: ''
  });
  constructor(private apiService: ApiService, private formBuilder: FormBuilder) { }

  onSubmit(): void {
    console.log( this.checkoutForm.value.longUrl);
    const params = {
      url: this.checkoutForm.value.longUrl,
    };

    this.apiService.getUrlDetails(this.checkoutForm.value.longUrl).subscribe((response) => {
      console.log('API Response:', response);
      this.checkoutForm.value.shortUrl = response.shortUrl;
    }, (error) => {
      console.error('API Error:', error);
    });
  }
}
