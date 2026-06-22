import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

const inputFile = './frontend/public/data/kommune_data.json';
const outputFile = './frontend/public/data/kommune_data.json.gz';

if (!fs.existsSync(inputFile)) {
    console.error(`Fichier introuvable : ${inputFile}. Place-le temporairement à cet endroit.`);
    process.exit(1);
}

const gzip = zlib.createGzip({ level: 9 });
const source = fs.createReadStream(inputFile);
const destination = fs.createWriteStream(outputFile);

source.pipe(gzip).pipe(destination).on('finish', () => {
    console.log('Compression Gzip réussie ! Le fichier .json.gz est standard et valide pour le navigateur.');
});