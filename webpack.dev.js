/* eslint-disable import/no-extraneous-dependencies */
const path = require('path'); // module node de manipulation de chemins de fichiers
const webpack = require('webpack'); // webpack
// const CopyWebpackPlugin = require('copy-webpack-plugin'); // Plugin de copie directe de fichiers
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Plugin de création HTML
const packageInfo = require('./package.json'); // info générale de l'app
const babelConfig = require('./babel.config'); // Info de config de babel

const PUBLIC_PATH = '/'; // url de base de l'appli
const SECRET = process.env.SECRET || 'c(Pq7#q762U74-66H5:zWhKQGB5,53~^FwzUJP!dMh4zM/fbg;$F%%@tnYP4Hds{jm*}T658=QVP2Z45)_7?iWz+53ybX7.][mh8';

module.exports = {
  mode: 'development',
  // Environnement cible du déploiement
  target: 'web',
  // Point d'entrée de l'application
  entry: './src/index.tsx',
  // Sortie
  output: {
    path: path.join(__dirname, 'build'), // chemin obligatoirement absolu
    filename: '[name].bundle.js',
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
        // Injection du CSS dans le DOM sous la forme de noeuds <style>
        { loader: 'style-loader', options: { injectType: 'styleTag' } },
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
        { loader: 'style-loader', options: { injectType: 'styleTag' } },
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
        { loader: 'style-loader', options: { injectType: 'styleTag' } },
        { loader: 'css-loader', options: { modules: false, } },
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
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,
    // host: 'local-ip', // Accessible uniquement d'une ip localhost (4 ou 6)
    historyApiFallback: true, // Evite d'afficher une page 404 plutot que la page index.html
    // quand on utilie HTML5 History API
    static: {
      directory: path.resolve(__dirname, 'build'),
    },
    open: true, // tente d'ouvre une page navigateur une fois le serveur lancé
    hot: true, // active le remplacement à chaud des modules
  },
};
