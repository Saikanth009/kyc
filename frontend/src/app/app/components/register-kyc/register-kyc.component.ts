import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-kyc.component.html',
  styleUrl: './register-kyc.component.scss'
})
export class RegisterKycComponent {
  model: any = { 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    aadhaar: '', 
    pan: '', 
    password: '',
    aadhaarFile: null,
    panFile: null,
    photoFile: null
  };
  loading = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  submit() {
    this.loading = true;
    this.error = '';
    
    // First, register the user
    const userPayload = { 
      name: this.model.name,
      email: (this.model.email || '').toLowerCase().trim(),
      phone: this.model.phone,
      address: this.model.address,
      aadhaar: this.model.aadhaar,
      pan: this.model.pan,
      password: this.model.password
    };

    this.api.register(userPayload).subscribe({
      next: (res: any) => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
          
          // After successful registration, upload the documents
          this.uploadDocuments();
        } else {
          this.loading = false;
          this.error = 'Registration failed - no token received';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed';
      },
    });
  }

  uploadDocuments() {
    const formData = new FormData();
    
    // Add files to FormData
    if (this.model.aadhaarFile) {
      formData.append('aadhaar', this.model.aadhaarFile);
      console.log('Added aadhaar file:', this.model.aadhaarFile.name);
    }
    if (this.model.panFile) {
      formData.append('pan', this.model.panFile);
      console.log('Added pan file:', this.model.panFile.name);
    }
    if (this.model.photoFile) {
      formData.append('photo', this.model.photoFile);
      console.log('Added photo file:', this.model.photoFile.name);
    }

    console.log('Uploading documents...');
    this.api.uploadDocuments(formData).subscribe({
      next: (user) => {
        console.log('Upload successful, user data:', user);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.loading = false;
        this.error = 'Registration successful but document upload failed. You can upload documents later from your dashboard.';
        // Still navigate to dashboard since user is registered
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
    });
  }
}
