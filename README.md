# Das Sanjeevan — Portfolio Website

Personal portfolio site. Pure HTML/CSS/JS — no build step, no dependencies.

## Structure

```
das-portfolio/
├── index.html        # All page content & structure
├── css/
│   └── style.css     # All styling (design tokens in :root at the top)
├── js/
│   └── main.js       # Nav, scroll reveal, mobile menu, contact form
├── assets/
│   └── das.jpg       # Profile photo
└── README.md
```

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Customize

- **Colors / fonts / spacing** — edit the CSS variables in `:root` at the top of `css/style.css` (`--accent`, `--paper`, `--ink`, etc.).
- **Content** — everything is in `index.html`, organized by section: hero, about, experience, projects (AI work), skills, credentials, contact.
- **Photo** — replace `assets/das.jpg` (square images work best; crop position is set via `object-position` in `.hero-portrait .disc img`).

## TODO before going live

1. **Résumé button** — put your PDF in the project (e.g. `assets/Das_Sanjeevan_Resume.pdf`), then in `index.html` change the résumé button:
   ```html
   <a href="assets/Das_Sanjeevan_Resume.pdf" download class="btn btn-ghost">
   ```
   and delete the `resumeBtn` alert handler at the bottom of `js/main.js`.
2. **Contact form** — currently opens the visitor's email app (mailto). To receive messages directly, swap to a form service like Formspree: change the `<form>` tag to `<form action="https://formspree.io/f/YOUR_ID" method="POST">` and remove the custom submit handler in `js/main.js`.
3. **Social links** — add LinkedIn/GitHub links in the nav or hero if wanted.

## Deploy

Any static host works: Netlify, Vercel, Cloudflare Pages, GitHub Pages. Upload the whole folder and point your domain at it.
