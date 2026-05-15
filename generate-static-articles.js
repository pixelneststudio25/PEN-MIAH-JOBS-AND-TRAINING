const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const yaml = require('js-yaml');

const converter = new showdown.Converter();
const articlesDir = './content/articles';
const outputDir = './articles';
const indexPath = './articles-index.json';

// Read the template for each article (we will reuse parts of your existing article.html)
// Instead of copying the entire template, we'll create a minimal but complete template.
const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - PEN-MIAH</title>
    <!-- Google Fonts + Font Awesome -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="/style.css">
    <!-- Open Graph / Social Media -->
    <meta property="og:title" content="{{TITLE}}" />
    <meta property="og:description" content="{{EXCERPT}}" />
    <meta property="og:image" content="{{IMAGE}}" />
    <meta property="og:url" content="https://penmiahjobs.com/articles/{{SLUG}}.html" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{TITLE}}" />
    <meta name="twitter:description" content="{{EXCERPT}}" />
    <meta name="twitter:image" content="{{IMAGE}}" />
    <!-- Favicon etc. -->
    <link rel="icon" type="image/png" sizes="32x32" href="/PENMIAH-FAVICON.png">
    <meta name="theme-color" content="#2596be">
</head>
<body>
    <!-- Header (copy the exact same header from your magazine.html or index.html) -->
    <!-- Please copy your full header HTML here. For brevity, I'm using a placeholder.
         You must replace the following block with your actual header, mobile menu, etc. -->
    {{HEADER}}

    <main>
        <div class="container">
            <article class="full-article">
                <h1>{{TITLE}}</h1>
                <div class="meta">
                    <span><i class="far fa-calendar-alt"></i> {{DATE}}</span>
                    <span><i class="fas fa-user"></i> {{AUTHOR}}</span>
                    <span><i class="fas fa-tag"></i> {{CATEGORY}}</span>
                </div>
                {{#IMAGE}}<img src="{{IMAGE}}" alt="Featured image">{{/IMAGE}}
                <div class="article-body">{{BODY}}</div>
                
                <!-- Social Share Buttons -->
                <div class="social-share-section">
                    <h4>Share this article:</h4>
                    <div class="social-share-buttons">
                        <a href="https://www.facebook.com/sharer/sharer.php?u={{ENCODED_URL}}" class="share-btn facebook" target="_blank"><i class="fab fa-facebook-f"></i> Facebook</a>
                        <a href="https://twitter.com/intent/tweet?text={{ENCODED_TITLE}}&url={{ENCODED_URL}}" class="share-btn twitter" target="_blank"><i class="fab fa-twitter"></i> Twitter</a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ENCODED_URL}}" class="share-btn linkedin" target="_blank"><i class="fab fa-linkedin-in"></i> LinkedIn</a>
                        <a href="https://wa.me/?text={{ENCODED_TITLE}}%20-%20{{ENCODED_URL}}" class="share-btn whatsapp" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    </div>
                </div>
                <a href="/magazine.html" class="btn btn-secondary">← Back to Magazine</a>
            </article>
        </div>
    </main>

    <!-- Footer (copy the exact same footer from your magazine.html or index.html) -->
    {{FOOTER}}

    <script src="/script.js"></script>
</body>
</html>`;

// Read existing header and footer from your magazine.html (or article.html) – we'll just copy them from a file.
function getHeaderFooter() {
    // We'll read your magazine.html and extract the header and footer.
    // This avoids duplicating code. Adjust the path if needed.
    const magazinePath = './magazine.html';
    let magazineHtml = fs.readFileSync(magazinePath, 'utf8');
    // Extract everything from <body> to <main> (header part) and from after </main> to </body> (footer part)
    // Simple approach: use regex to split. Not perfect but works.
    const bodyMatch = magazineHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (!bodyMatch) throw new Error('Cannot parse magazine.html');
    const bodyContent = bodyMatch[1];
    // Find where <main> starts and where </main> ends
    const mainStart = bodyContent.indexOf('<main');
    const mainEnd = bodyContent.lastIndexOf('</main>') + 7;
    const headerPart = bodyContent.substring(0, mainStart);
    const footerPart = bodyContent.substring(mainEnd);
    return { header: headerPart, footer: footerPart };
}

// Read all markdown files
if (!fs.existsSync(articlesDir)) {
    console.log('No articles directory, skipping');
    process.exit(0);
}
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));
const articles = [];

const { header, footer } = getHeaderFooter();

for (const file of files) {
    const slug = file.replace('.md', '');
    const mdContent = fs.readFileSync(path.join(articlesDir, file), 'utf8');
    const parts = mdContent.split('---');
    if (parts.length < 3) continue;
    const frontmatterRaw = parts[1];
    const bodyMarkdown = parts.slice(2).join('---').trim();
    const frontmatter = yaml.load(frontmatterRaw);
    const title = frontmatter.title || 'Untitled';
    const date = frontmatter.date || '';
    const author = frontmatter.author || 'PEN-MIAH';
    const category = frontmatter.category || '';
    const image = frontmatter.image || 'https://penmiahjobs.com/images/default-social.jpg';
    const excerpt = frontmatter.excerpt || (bodyMarkdown.substring(0, 150).replace(/\n/g, ' ') + '...');
    const bodyHtml = converter.makeHtml(bodyMarkdown);
    const articleUrl = `https://penmiahjobs.com/articles/${slug}.html`;
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(title);

    let articleHtml = template
        .replace(/{{TITLE}}/g, title)
        .replace(/{{EXCERPT}}/g, excerpt)
        .replace(/{{IMAGE}}/g, image)
        .replace(/{{SLUG}}/g, slug)
        .replace(/{{DATE}}/g, date)
        .replace(/{{AUTHOR}}/g, author)
        .replace(/{{CATEGORY}}/g, category)
        .replace('{{BODY}}', bodyHtml)
        .replace(/{{ENCODED_URL}}/g, encodedUrl)
        .replace(/{{ENCODED_TITLE}}/g, encodedTitle)
        .replace('{{HEADER}}', header)
        .replace('{{FOOTER}}', footer);

    // Remove any template conditional markers (like {{#IMAGE}}...{{/IMAGE}}) – simple manual:
    if (image) {
        articleHtml = articleHtml.replace(/{{#IMAGE}}/, '').replace(/{{\/IMAGE}}/, '');
    } else {
        articleHtml = articleHtml.replace(/{{#IMAGE}}.*?{{\/IMAGE}}/s, '');
    }

    const outputPath = path.join(outputDir, `${slug}.html`);
    fs.writeFileSync(outputPath, articleHtml);
    console.log(`Generated ${outputPath}`);

    articles.push({
        slug: slug,
        title: title,
        date: date,
        category: category,
        image: image,
        excerpt: excerpt,
        url: `/articles/${slug}.html`
    });
}

// Sort articles by date descending
articles.sort((a,b) => new Date(b.date) - new Date(a.date));
fs.writeFileSync(indexPath, JSON.stringify(articles, null, 2));
console.log(`Updated ${indexPath}`);
