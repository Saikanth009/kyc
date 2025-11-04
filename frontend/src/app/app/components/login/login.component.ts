import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  model: any = { email: '', password: '' };
  loading = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  submit() {
    this.loading = true;
    this.error = '';
    const payload = {
      email: (this.model.email || '').toLowerCase().trim(),
      password: this.model.password
    };
    this.api.login(payload).subscribe({
      next: ({ token }) => {
        localStorage.setItem('token', token);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Login failed';
      },
    });
  }
}
