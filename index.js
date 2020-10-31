//  Imports
//

import proprietaryVendor from 'youtube-mp3-downloader';
import consoleColor from 'colors';
import readline from 'readline';
import * as fs from 'fs';
import path from 'path';

//  Definitions
//

const listArr = [ ];
var YouTube = new proprietaryVendor ({
    'ffmpegPath': `C:\\ffmpeg\\ffmpeg.exe`, // FFmpeg binary location
    'outputPath': 'C:\\ffmpeg\\Musicas',            // Output file location (default: the home directory)
    'youtubeVideoQuality': 'highestaudio',  // Desired video quality (default: highestaudio)
    'queueParallelism': 2,                  // Download parallelism (default: 1)
    'progressTimeout': 2000,                // Interval in ms for the progress reports (default: 1000)
    'allowWebm': false                      // Enable download from WebM sources (default: false)
});

//  Functions
//

const logConsole = ( text, color ) => {
    if ( !color ) color = 'white';
    return console.log ( consoleColor [ color ] ( text ) );
}

const getVideoId = ( url ) => {
    
    var regEx = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    var matches = url.match ( regEx );
    
    if ( matches ) {
        return matches [ 1 ];
    }

    return false;
}

const readLines = ( ) => {
    logConsole ( 'Started Downloader', 'magenta' );

    const read = readline.createInterface ( fs.createReadStream( './videoList.txt' ) );

    read.on ( 'line', ( line ) => {

        if ( line.length < 1 ) return;

        listArr.push ( line );

    } );

    read.on ( 'close', ( ) => {

        if ( listArr.length < 1 ) return logConsole ( 'Failed on read video List! ', 'red' );
        
        logConsole ( `successfully read! youtube list length: ${ listArr.length }`, 'green' );

        startMachinedDownloader ( );
    });
};

const startMachinedDownloader = ( ) => {

    for ( let uri of listArr ) {

        if ( getVideoId ( uri ) == null ) return logConsole ( `Error: Fail on read this link: ${ uri }`, 'red' );

        YouTube.download ( getVideoId ( uri ) );
 
        YouTube.on ( 'finished', ( err, data ) => {

            logConsole ( JSON.stringify ( data ), 'blue' );

        } );
 
        YouTube.on ( 'error', ( error ) => {
            
            logConsole ( error, 'red' );

        } );
        
        YouTube.on ( 'progress', ( progress ) => {
            
            logConsole ( JSON.stringify ( progress ), 'green' );

        });
        
    }

}

//  Process Handler's
//

process.on ( 'uncaughtException', err => { logConsole ( `Exception: ${ err }`, 'red' ) });
process.on ( 'unhandledRejection', err => { logConsole ( `Rejection: ${ err }`, 'red' ) });

//  Call read function
//

readLines ( );