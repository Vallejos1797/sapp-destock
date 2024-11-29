const webpack = require('webpack');
const dotenv = require('dotenv');

// Cargar las variables de entorno desde el archivo ..env
dotenv.config();

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'API_URL': JSON.stringify(process.env["API_URL"]),
        'API_URL_LOCAL': JSON.stringify(process.env["API_URL_LOCAL"]),
        'PRODUCTION': JSON.stringify(process.env["PRODUCTION"])
      }
    })
  ]
};
