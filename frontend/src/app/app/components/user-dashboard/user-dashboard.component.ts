import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {
  @ViewChild('aadhaarInput') aadhaarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('panInput') panInput!: ElementRef<HTMLInputElement>;
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  me: any;
  status = '';
  error = '';
  uploadError = '';
  successMessage = '';
  baseUrl = 'http://localhost:4000';
  cacheBust = Date.now();

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.me().subscribe({
      next: (u) => {
        console.log('User data received:', u);
        this.me = u;
        this.status = u?.status;
      },
      error: () => (this.error = 'Failed to load profile'),
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  triggerFileUpload(documentType: string) {
    switch (documentType) {
      case 'aadhaar':
        this.aadhaarInput.nativeElement.click();
        break;
      case 'pan':
        this.panInput.nativeElement.click();
        break;
      case 'photo':
        this.photoInput.nativeElement.click();
        break;
    }
  }

  uploadSingleDocument(documentType: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    const formData = new FormData();
    formData.append(documentType, file);

    console.log(`Uploading ${documentType} document:`, file.name);
    this.api.uploadDocuments(formData).subscribe({
      next: (user) => {
        this.me = user;
        this.uploadError = '';
        this.successMessage = `${documentType} document uploaded successfully!`;
        this.cacheBust = Date.now();
        console.log(`${documentType} document uploaded successfully`);
        // Clear the input
        input.value = '';
        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.uploadError = 'Upload failed. Please try again.';
        this.successMessage = '';
        input.value = '';
      },
    });
  }

  deleteDocument(documentType: string) {
    if (confirm(`Are you sure you want to delete the ${documentType} document?`)) {
      // Create a FormData with empty file to indicate deletion
      const formData = new FormData();
      formData.append(documentType, new Blob(), ''); // Empty file to indicate deletion
      
      this.api.uploadDocuments(formData).subscribe({
        next: (user) => {
          this.me = user;
          this.cacheBust = Date.now();
          this.successMessage = `${documentType} document deleted successfully!`;
          this.uploadError = '';
          console.log(`${documentType} document deleted successfully`);
          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.uploadError = 'Delete failed. Please try again.';
          this.successMessage = '';
        },
      });
    }
  }

  upload(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    this.api.uploadDocuments(formData).subscribe({
      next: (u) => {
        this.me = u;
        this.uploadError = '';
        this.cacheBust = Date.now();
      },
      error: () => (this.uploadError = 'Upload failed'),
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  openFile(url: string) {
    window.open(url, '_blank');
  }
}
