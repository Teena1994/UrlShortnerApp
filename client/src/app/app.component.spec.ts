import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ApiService } from './api.service';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let apiService: ApiService;
  const mockApiResponse = {
    shortUrl: 'https://shrtco.de/3YokP',
    updatedDate: 'just now',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [ApiService, FormBuilder],
      imports: [HttpClientModule]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should handle a successful form submission', () => {
    const apiServiceSpy = spyOn(apiService, 'getUrlDetails').and.returnValue(of(mockApiResponse));
    const longUrl = 'https://www.google.com/search?q=dogs';
    component.checkoutForm.setValue({ longUrl });
    component.onSubmit();
    expect(apiServiceSpy).toHaveBeenCalledWith(longUrl);
  });
  it('should copy URL to clipboard', () => {
    const spy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    component.shortUrl = 'shrtco.de/3YokP';
    component.copyUrl();
    expect(spy).toHaveBeenCalledWith(`https://${component.shortUrl}`);
    expect(component.isCopied).toBe(true);
  });

  it('should open URL in a new tab', () => {
    const spy = spyOn(window, 'open');
    component.shortUrl = 'shrtco.de/3YokP';
    component.openNewTab();
    expect(spy).toHaveBeenCalledWith(`https://${component.shortUrl}`, '_blank');
  });

  it('should handle an error during form submission', () => {
    const errorMessage = 'An error occurred.';
    spyOn(apiService, 'getUrlDetails').and.returnValue(throwError(errorMessage));
    const alertSpy = spyOn(window, 'alert');
    component.onSubmit();
    expect(component.shorturlSuccess).toBe(false);
    expect(component.shorturlErr).toBe(errorMessage);
    expect(alertSpy).toHaveBeenCalledWith(JSON.stringify(errorMessage));
  });

});
