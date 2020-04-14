/*
MAPPINGS: http://export.mcpbot.bspk.rs/
*/

/*
    Variables
*/
let src_path = 'java';          //Chemin des sources java

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
let replace_match = 0;

applyMappings();

function applyMappings() {
    parseCSV('mcpbots/fields.csv', replaceFromCSV, () => {
        parseCSV('mcpbots/methods.csv', replaceFromCSV, () => {
            parseCSV('mcpbots/params.csv', replaceFromCSV, () => {
                if (replace_match != 0) {
                    console.log('all replace match ' + replace_match);
                    replace_match = 0;  //reset value

                    applyMappings();
                } else {
                    console.log("terminate.");
                }
            });
        });
    });
}

//Functions
function replaceFromCSV(file, csv_array, callback) {
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
        const nbr_results = countResults(func_results)
        console.log("functions replace: " + nbr_results.toString());
        replace_match += nbr_results;
    }

    callback();
}

function parseCSV(file, callback, onEnd) {
    let results = [];

    fs.createReadStream(file)
        .pipe(csv_parser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log("finish read " + file);
            callback(file, results, onEnd);
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