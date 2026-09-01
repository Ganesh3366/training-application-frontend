import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { UrlTree } from '@angular/router';

export type BackNavigationTarget = string | readonly (string | number)[] | UrlTree;

@Component({
  selector: 'app-back-navigation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './back-navigation.html',
  styleUrl: './back-navigation.css',
})
export class BackNavigationComponent {
  readonly label = input.required<string>();
  readonly destination = input.required<BackNavigationTarget>();
}
