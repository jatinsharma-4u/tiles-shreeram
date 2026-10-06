const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const SRC = path.resolve(__dirname, 'src');
const SITE_URL = 'https://www.haritraders.example';

/** Tiny HTML include system: {{include:name}} -> src/partials/name.html, {{key}} -> page vars */
function render(file, vars) {
  const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');
  let html = read(file);
  html = html.replace(/{{include:([\w-]+)}}/g, (_, n) => read(`partials/${n}.html`));
  return html.replace(/{{(\w+)}}/g, (_, k) => (k in vars ? vars[k] : ''));
}

const pages = [
  {
    file: 'index.html',
    out: 'index.html',
    vars: {
      page: 'home',
      title: 'Premium Tiles & Surfaces | Hari Traders',
      description:
        'Hari Traders, premium marble, stone, concrete, wood-look and terrazzo tiles for residential and commercial interiors. Explore the collection and enquire online.',
      canonical: `${SITE_URL}/`,
      ogImage: `${SITE_URL}/images/scene-living-oak.webp`,
      navClass: '',
    },
  },
  {
    file: 'products.html',
    out: 'products.html',
    vars: {
      page: 'catalogue',
      title: 'Tile Catalogue: Floor, Wall & Outdoor Tiles | Hari Traders',
      description:
        'Browse the full Hari Traders tile catalogue. Filter by colour, finish, size, material and application, then enquire about your selection.',
      canonical: `${SITE_URL}/products.html`,
      ogImage: `${SITE_URL}/images/scene-living-cream.webp`,
      navClass: 'is-solid',
    },
  },
  {
    file: 'product.html',
    out: 'product.html',
    vars: {
      page: 'product',
      title: 'Tile Details | Hari Traders',
      description: 'Product details, specifications and enquiry for Hari Traders premium tiles.',
      canonical: `${SITE_URL}/product.html`,
      ogImage: `${SITE_URL}/images/scene-bathroom-white.webp`,
      navClass: 'is-solid',
    },
  },
  {
    file: 'about.html',
    out: 'about.html',
    vars: {
      page: 'about',
      title: 'About Hari Traders | Premium Tiles & Surfaces',
      description: 'The story behind Hari Traders, how we choose premium marble, stone, concrete, wood-look and terrazzo tiles for homes and commercial spaces.',
      canonical: `${SITE_URL}/about.html`,
      ogImage: `${SITE_URL}/images/scene-living-oak.webp`,
      navClass: 'is-solid',
    },
  },
  {
    file: 'collections.html',
    out: 'collections.html',
    vars: {
      page: 'collections',
      title: 'Tile Collections: Marble, Stone, Concrete, Wood, Terrazzo | Hari Traders',
      description: 'Explore six Hari Traders collections: Aurelia marble, Terra stone, Atelier concrete, Quercus wood, Venezia terrazzo and Metallo metal-look tiles.',
      canonical: `${SITE_URL}/collections.html`,
      ogImage: `${SITE_URL}/images/scene-bathroom-white.webp`,
      navClass: 'is-solid',
    },
  },
  {
    file: 'contact.html',
    out: 'contact.html',
    vars: {
      page: 'contact',
      title: 'Contact & Enquiries | Hari Traders',
      description: 'Contact Hari Traders for tile recommendations, samples and quotes. Call, WhatsApp, email or send an enquiry online.',
      canonical: `${SITE_URL}/contact.html`,
      ogImage: `${SITE_URL}/images/scene-kitchen.webp`,
      navClass: 'is-solid',
    },
  },
];

class PartialsWatch {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('PartialsWatch', (c) => {
      const dir = path.join(SRC, 'partials');
      fs.readdirSync(dir).forEach((f) => c.fileDependencies.add(path.join(dir, f)));
      pages.forEach((p) => c.fileDependencies.add(path.join(SRC, p.file)));
    });
  }
}

module.exports = (env, argv) => {
  const prod = argv.mode === 'production';
  return {
    entry: { main: './src/js/main.js' },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: prod ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      chunkFilename: prod ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      assetModuleFilename: 'fonts/[name].[contenthash:8][ext]',
      publicPath: '',
      clean: true,
    },
    devtool: prod ? false : 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' } }, // extracted in dev too: CSS must be render-blocking, never injected after paint (no unstyled flash)
            'css-loader',
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  quietDeps: true,
                  silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'legacy-js-api'],
                },
              },
            },
          ],
        },
        { test: /\.(woff2?|ttf)$/, type: 'asset/resource' },
      ],
    },
    plugins: [
      ...pages.map(
        (p) =>
          new HtmlWebpackPlugin({
            filename: p.out,
            templateContent: () => render(p.file, p.vars),
            inject: 'body',
            scriptLoading: 'defer',
            minify: prod ? { collapseWhitespace: true, removeComments: true } : false,
          })
      ),
      new PartialsWatch(),
      new CopyPlugin({
        patterns: [
          { from: 'src/images', to: 'images' },
          { from: 'src/static', to: '.', noErrorOnMissing: true },
        ],
      }),
      new MiniCssExtractPlugin({ filename: prod ? 'css/[name].[contenthash:8].css' : 'css/[name].css' }),
    ],
    optimization: { minimizer: ['...', new CssMinimizerPlugin()], splitChunks: { chunks: 'async' } },
    performance: { hints: false },
    devServer: { port: 3000, hot: false, liveReload: true, watchFiles: ['src/**/*.html'], static: false, open: false },
  };
};
