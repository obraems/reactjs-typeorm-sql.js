/* eslint-disable import/no-extraneous-dependencies */
const path = require('path'); // module node de manipulation de chemins de fichiers
const fs = require('fs'); // module node d'accès au SGF
const webpack = require('webpack'); // webpack
// const CopyWebpackPlugin = require('copy-webpack-plugin'); // Plugin de copie directe de fichiers
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Plugin de création HTML
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const packageInfo = require('./package.json'); // info générale de l'app
const babelConfig = require('./babel.config'); // Info de config de babel

const PUBLIC_PATH = './'; // url de base de l'appli
const SECRET = process.env.SECRET || 'z-;A8x+w56V7=qZKXaz{8.%NarA/f{8z~?]eb3T378_fbyCV,*z6V4rQ!h4j5H}(2Eaf7t9^4#ZH)J:jRV[kt2V9W$6S8@63WB4C';

module.exports = {
  mode: 'production',
  // Environnement cible du déploiement
  target: 'web',
  // Point d'entrée de l'application
  entry: './src/index.tsx',
  // Sortie
  output: {
    path: path.join(__dirname, 'build'), // chemin obligatoirement absolu
    filename: '[name].[contenthash].bundle.js', // Ajout un hash pour s'assurer le telechargement du nouveau code produit par le navigateur
    publicPath: PUBLIC_PATH,
    clean: true, // efface le contenu du dossier de sortie avant regénération
  },
  // plugins de construction
  plugins: [
    // Définition de variables d'environnement injectable dans le code-source
    new webpack.DefinePlugin({
      'APP_ENV.APP_PUBLIC_PATH': JSON.stringify(PUBLIC_PATH),
      'APP_ENV.APP_TITLE': JSON.stringify(packageInfo.appTitle),
      'APP_ENV.SECRET': JSON.stringify(SECRET),
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^react-native-sqlite-storage$/,
    }),
    new webpack.ProvidePlugin({
      'window.SQL': 'sql.js/dist/sql-wasm.js',
      'window.localforage': 'localforage/dist/localforage.js',
    }),
    new webpack.NormalModuleReplacementPlugin(/typeorm$/, ((result) => {
      result.request = result.request.replace(/typeorm/, 'typeorm/browser');
    })),
    // Copie directe de fichiers
    // new CopyWebpackPlugin({
    //   patterns: []
    // }),
    // Génération du fichier index.html à partir d'un template
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      title: packageInfo.appTitle,
      // favicon: './src/favicon.ico',
      meta: {
        description: packageInfo?.description ?? 'no description',
        keywords: packageInfo?.keywords?.join(', ') ?? '',
        author: packageInfo?.author ?? 'unknown',
      },
    }),
    // Séparation des CSS du code JS dans des fichiers séparés
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    // Injections des licences
    new webpack.BannerPlugin(fs.readFileSync('./LICENSE', 'utf8')),
    // Creation de rapports statistiques sur la taille des bundles
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'buildInfos/report.html',
      generateStatsFile: true,
      statsFilename: 'buildInfos/stats.json',
      openAnalyzer: false,
    }),
  ],
  // définit comment les modules vont être chargés
  // //ajoute les extensions .jsx et .scss aux extensions gérées
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.scss','.css', '.wasm'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
      util: require.resolve('util/'),
    },
  },
  // modules de configuration selon le type de fichier rencontré
  module: {
    rules: [{
      // Gestion des fichiers css
      test: /\.css$/i,
      use: [
        // Injection du CSS dans un fichier séparé
        MiniCssExtractPlugin.loader,
        // Interprête le CSS en CommonJS et autorise les modules
        // les fichiers sont générés en mode dev. (car devtool activté)
        {
          loader: 'css-loader',
          options: {
            modules: {
              exportLocalsConvention(name) {
                return [
                  name.replace(/-/g, '_'),
                  // dashesCamelCase
                  name.replace(/-+(\w)/g, (match, firstLetter) => firstLetter.toUpperCase()),
                ];
              },
            },
            esModule: false,
          },
        },
      ],
    }, {
      // Gestion des fichiers sass de l'appli (modules css par défaut)
      test: /\.s[ac]ss$/i,
      exclude: /scss-config\.s[ac]ss$/i,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            modules: {
              exportLocalsConvention(name) {
                return [
                  name.replace(/-/g, '_'),
                  // dashesCamelCase
                  name.replace(/-+(\w)/g, (match, firstLetter) => firstLetter.toUpperCase()),
                ];
              },
            },
            esModule: false,
          },
        },
        // Compile les instruction sass en css
        'sass-loader',
      ],
    }, {
      // Gestion du fichier sass de chargement de chargement / custome de boostrap
      test: /scss-config\.s[ac]ss$/i,
      use: [
        MiniCssExtractPlugin.loader,
        { loader: 'css-loader', options: { modules: false } },
        'sass-loader',
      ],
    }, {
      // Gestion des fichiers images
      test: /\.(png|svg|jpg|jpeg|gif)$/i,
      type: 'asset/resource', // le module asset émet un fichier séparé du bundle et exporte son url
    }, {
      // Gestion des polices d'écriture
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource', // le module asset émet un fichier séparé du bundle et exporte son url
    }, {
      // Gestion du code-source js et jsx en utilisant babel pour
      // la transpilation
      // Exclut les fichiers js de node_modules du passage par babel
      test: /\.(js|jsx)$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: babelConfig, // configuration séparé car ré-utilisé avec eslint
      },
    }, {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'ts-loader',
      },
    }, {
      test: /\.wasm$/,
      type: 'javascript/auto',
      use: {
        loader: 'file-loader',
        options: {
          outputPath: 'wasm',
          name: '[name].[ext]',
        },
      },
    }],
  },
  optimization: {
    moduleIds: 'deterministic', // les ids de modules sont calculés de manière à ne pas changer sur le module ne change pas
    runtimeChunk: 'single', // Créer un seul runtime code pour l'ensemble des chunks
    splitChunks: { // Met à part les codes des biblio tierces
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    minimizer: [
      '...', // utilise les paramètres par défaut des minimzer (TerserPlugin pour minifier et minimiser JS)
      new CssMinimizerPlugin(), // minimise CSS
    ],
  },
  devtool: 'source-map', // genere des source map pour la prod
};
