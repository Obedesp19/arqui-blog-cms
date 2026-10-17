import {
  Component,
  Input,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-markdown-content',
  standalone: true,
  template: `
    <div class="cms-markdown" [innerHTML]="html"></div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    app-markdown-content {
      display: block;
      min-width: 0;
    }

    app-markdown-content .cms-markdown {
      line-height: 1.7;
      overflow-wrap: anywhere;
    }

    app-markdown-content .cms-markdown img {
      max-width: 100%;
      height: auto;
    }

    app-markdown-content .cms-markdown pre {
      padding: 1rem;
      overflow-x: auto;
      white-space: pre;
      border-radius: 0.5rem;
      background: #f3f4f6;
      color: #111827;
    }

    app-markdown-content .cms-markdown code {
      font-family: monospace;
    }

    app-markdown-content .cms-markdown blockquote {
      margin-left: 0;
      padding-left: 1rem;
      border-left: 4px solid #9ca3af;
    }

    app-markdown-content .cms-markdown table {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      border-collapse: collapse;
    }

    app-markdown-content .cms-markdown th,
    app-markdown-content .cms-markdown td {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
    }
  `],
})
export class MarkdownContent implements OnChanges {
  @Input({ required: true }) content = '';

  html = '';

  ngOnChanges(): void {
    const rendered = marked.parse(this.content, {
      async: false,
      gfm: true,
      breaks: false,
    });

    this.html = DOMPurify.sanitize(rendered, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'b', 'em', 'i', 'del', 's',
        'blockquote',
        'ul', 'ol', 'li',
        'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tfoot',
        'tr', 'th', 'td',
      ],
      ALLOWED_ATTR: [
        'href',
        'title',
        'src',
        'alt',
        'start',
      ],
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false,
    });
  }
}