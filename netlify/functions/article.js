// netlify/functions/article.js
const path = require('path');
const fs = require('fs').promises;

exports.handler = async (event, context) => {
    const url = new URL(event.rawUrl);
    const slug = url.searchParams.get('slug');
    if (!slug) {
        return { statusCode: 404, body: 'Article not found' };
    }

    // Path to the Markdown file (adjust if your articles are elsewhere)
    const mdPath = path.join(process.cwd(), 'content/articles', `${slug}.md`);
    let markdown;
    try {
        markdown = await fs.readFile(mdPath, 'utf8');
    } catch (err) {
        return { statusCode: 404, body: 'Article not found' };
    }

    // Parse frontmatter
    const parts = markdown.split('---');
    const frontmatter = parts[1];
    const titleMatch = frontmatter.match(/title:\s*(.+)/);
    const imageMatch = frontmatter.match(/image:\s*(.+)/);
    const excerptMatch = frontmatter.match(/excerpt:\s*(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : 'PEN-MIAH';
    const image = imageMatch ? imageMatch[1].trim() : 'https://penmiahjobs.com/images/default-social.jpg';
    const description = excerptMatch ? excerptMatch[1].trim() : 'Read this article from PEN-MIAH';

    // Read the original article.html template
    const templatePath = path.join(process.cwd(), 'article.html');
    let html = await fs.readFile(templatePath, 'utf8');

    // Inject the meta tags into the <head>
    const metaTags = `
        <meta property="og:title" content="${escapeHtml(title)}" />
        <meta property="og:description" content="${escapeHtml(description)}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:url" content="${event.rawUrl}" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${escapeHtml(title)}" />
        <meta name="twitter:description" content="${escapeHtml(description)}" />
        <meta name="twitter:image" content="${image}" />
    `;
    // Insert before </head>
    html = html.replace('</head>', `${metaTags}</head>`);

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: html
    };
};

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
