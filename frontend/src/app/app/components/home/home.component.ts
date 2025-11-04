import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  me: any;
  baseUrl = 'http://localhost:4000';

  constructor(private api: ApiService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.api.me().subscribe({ next: (u) => (this.me = u) });
    }
  }
}
