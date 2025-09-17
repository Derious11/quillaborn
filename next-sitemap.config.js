/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.quillaborn.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  outDir: './public',

  // Ensure blog posts are included
  transform: async (config, path) => {
    // Default transform
    let result = {
      loc: path, // => https://www.quillaborn.com/path
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };

    // Boost blog and home priority
    if (path === '/blog' || path.startsWith('/blog/')) {
      result.priority = 0.9;
      result.changefreq = 'monthly';
    }
    if (path === '/') {
      result.priority = 1.0;
    }

    return result;
  },
};
