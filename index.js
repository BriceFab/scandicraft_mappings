/*
MAPPINGS: http://export.mcpbot.bspk.rs/
*/

/*
    Variables
*/
let src_path = 'test';          //Chemin des sources java

//imports/requires
const globby = require('globby');
const replace = require('replace-in-file');
const csv_parser = require('csv-parser')
const fs = require('fs')
const path = require('path');

//list files
const listAllFilesAndDirs = dir => globby.sync(`${dir}/**/*`);
const all_sources = listAllFilesAndDirs(src_path);

console.log("Sources: " + all_sources.length);

//replaces functions
parseCSV('mcpbots/fields.csv', replaceFromCSV);
parseCSV('mcpbots/methods.csv', replaceFromCSV);
parseCSV('mcpbots/params.csv', replaceFromCSV);

//Functions
function replaceFromCSV(file, csv_array) {
    let from = csv_array.map(item => {
        if (file.includes('params.csv')) {
            return item.param
        } else {
            return item.searge
        }
    });
    let to = csv_array.map(item => {
        return item.name
    });

    if (from.length !== to.length) {
        console.error("problem when parsing csv");
    } else {
        const func_results = replaceInSources(all_sources, from, to);
        console.log("functions replace: " + countResults(func_results));
    }
}

async function parseCSV(file, callback) {
    let results = [];

    await fs.createReadStream(file)
        .pipe(csv_parser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log("finish read " + file);
            callback(file, results);
        });
}

function replaceInSources(files, from, to) {
    const results = replace.sync({
        files: all_sources,
        from: from,
        to: to,
        countMatches: true,
        encoding: 'utf8',
    });

    return results;
}

function countResults(tab) {
    let count = 0;
    tab.forEach(element => {
        if (element.hasChanged) {
            count += element.numReplacements;
        }
    });
    return count;
}