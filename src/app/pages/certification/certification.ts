import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-certification',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="certification-page">
      <section class="hero" aria-labelledby="certification-title">
        <div class="hero-icon" aria-hidden="true"><mat-icon>workspace_premium</mat-icon></div>
        <p class="eyebrow">Recognition that travels with you</p>
        <h1 id="certification-title">SkillForge Certificates</h1>
        <p class="intro">
          Earn a Certificate of Completion by finishing every module and passing the
          required quizzes in your course.
        </p>
        <a mat-flat-button routerLink="/courses">Explore Courses</a>
      </section>

      <section class="details" aria-labelledby="certificate-process-title">
        <div>
          <p class="eyebrow">How it works</p>
          <h2 id="certificate-process-title">From learning to achievement</h2>
        </div>
        <ol>
          <li>
            <span>1</span>
            <div>
              <h3>Complete every module</h3>
              <p>Work through all learning content in the course.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <h3>Pass required quizzes</h3>
              <p>Meet the passing score defined for each required quiz.</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <h3>Open your certificate</h3>
              <p>Return to the completed course and select View Certificate.</p>
            </div>
          </li>
        </ol>
      </section>

      <section class="certificate-contents" aria-labelledby="certificate-contents-title">
        <h2 id="certificate-contents-title">Your achievement</h2>
        <p>
          Each certificate includes your participant name, course name, completion date, final score
          and unique certificate number.
        </p>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: calc(100vh - 112px);
      background: #f6f9ff;
    }
    .certification-page {
      max-width: 1080px;
      margin: 0 auto;
      padding: 42px 34px 58px;
    }
    section {
      border: 1px solid #dce7f5;
      border-radius: 16px;
      background: #fff;
    }
    .hero {
      padding: 54px 28px;
      text-align: center;
      box-shadow: 0 14px 36px rgba(19, 61, 112, 0.09);
    }
    .hero-icon {
      width: 62px;
      height: 62px;
      display: grid;
      place-items: center;
      margin: 0 auto 14px;
      border-radius: 50%;
      color: #0873db;
      background: #eaf4ff;
    }
    .hero-icon mat-icon {
      width: 34px;
      height: 34px;
      font-size: 34px;
    }
    .eyebrow {
      margin: 0 0 7px;
      color: #0871d4;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }
    h1,
    h2,
    h3 {
      color: #06183a;
    }
    h1 {
      margin: 0;
      font-size: clamp(32px, 5vw, 46px);
    }
    .intro {
      max-width: 650px;
      margin: 15px auto 24px;
      color: #536073;
      font-size: 17px;
      line-height: 1.65;
    }
    .hero a {
      color: #fff !important;
      background: #0873db !important;
      font-weight: 700;
    }
    .details {
      display: grid;
      grid-template-columns: 0.8fr 1.2fr;
      gap: 42px;
      margin-top: 22px;
      padding: 34px;
    }
    h2 {
      margin: 0;
      font-size: 26px;
    }
    ol {
      display: grid;
      gap: 22px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      gap: 15px;
    }
    li > span {
      width: 34px;
      height: 34px;
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 50%;
      color: #fff;
      background: #0873db;
      font-weight: 800;
    }
    h3 {
      margin: 2px 0 4px;
      font-size: 17px;
    }
    li p,
    .certificate-contents p {
      margin: 0;
      color: #536073;
      line-height: 1.55;
    }
    .certificate-contents {
      margin-top: 22px;
      padding: 28px 34px;
      text-align: center;
    }
    .certificate-contents p {
      margin-top: 9px;
    }
    @media (max-width: 700px) {
      :host {
        min-height: calc(100vh - 78px);
      }
      .certification-page {
        padding: 24px 16px 38px;
      }
      .hero {
        padding: 40px 20px;
      }
      .details {
        grid-template-columns: 1fr;
        gap: 26px;
        padding: 26px 20px;
      }
      .certificate-contents {
        padding: 24px 20px;
      }
    }
  `,
})
export class Certification {}
