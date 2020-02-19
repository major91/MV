/**
 * @author biud436
 * @help
 * Aria2c is the utility that can download the file even faster.
 * 
 * node Downloader.js v0.44.1
 * 
 * /f라는 명령행 옵션을 추가하면 https 라이브러리로 파일 다운로드를 수행합니다.
 * Github의 경우, ZIP를 다운로드 할 때, 302 응답 코드를 보낸 후, 
 * 실제 다운로드가 가능한 페이지로 리다이렉션하고 200 응답 코드를 반환합니다.
 * 첫 시도에서 200 응답 코드를 받지 못하면 다운로드를 실패하게 됩니다.
 * 
 * node Downloader.js v0.44.1 /f
 * 
 * Aria2c가 없으면 https 라이브러리로 다운로드가 수행됩니다.
 */

const Aria2c = require('./Aria2c');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const DecompressZip = require('decompress-zip');
const fileGet = require("./fileGet");
const async = require('async');
const {
    promisify
} = require('util');

const readdirAsync = promisify(fs.readdir);

const args = process.argv.slice(2);

const VERSION = args[0];
const option = args[1];

let mainPath = process.cwd().replace( /\\/g, '/' );
let outputPath = `${mainPath}/${VERSION}`.replace( /\\/g, '/' );

let Color = {
    Reset : "\x1b[0m",
    Bright : "\x1b[1m",
    Dim : "\x1b[2m",
    Underscore : "\x1b[4m",
    Blink : "\x1b[5m",
    Reverse : "\x1b[7m",
    Hidden : "\x1b[8m",
    
    FgBlack : "\x1b[30m",
    FgRed : "\x1b[31m",
    FgGreen : "\x1b[32m",
    FgYellow : "\x1b[33m",
    FgBlue : "\x1b[34m",
    FgMagenta : "\x1b[35m",
    FgCyan : "\x1b[36m",
    FgWhite : "\x1b[37m",
    
    BgBlack : "\x1b[40m",
    BgRed : "\x1b[41m",
    BgGreen : "\x1b[42m",
    BgYellow : "\x1b[43m",
    BgBlue : "\x1b[44m",
    BgMagenta : "\x1b[45m",
    BgCyan : "\x1b[46m",
    BgWhite : "\x1b[47m",       
};

let config = {
    referrer : `https://dl.nwjs.io/`,
    userAgent : `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36`,
    inputFile : "input.txt",
    logFile : "log.txt",
};

String.prototype.splitOnLast = function (e) {
    var t = this.lastIndexOf(e) + 1;
    return 0 > t ? this : this.substr(t);
};

class Downloader {

    constructor() {
        this._output = [];
        this._isAria2c = false;

        this.checkAria2c();
    }

    processLine(line) {
        const filename = line.splitOnLast("/");
        this._output.push(line);
        this._output.push(`  dir=${outputPath}`);
        this._output.push(`  out=${filename}`);
    }

    checkAria2c() {
        
        if(option === "/f") {
            this._isAria2c = false;
            return;
        }

        const env = process.env["PATH"].split(";");
        const needed = env.filter(dir => dir.indexOf("aria") >= 0);
        console.log(needed);
        needed.forEach(i => {
            if(fs.existsSync(path.join(i.replace(/\\/g, "/"), "aria2c.exe"))) {
                console.log("aria2c.exe 파일을 찾았습니다.");
                this._isAria2c = true;
            }
        });
    }

    removeFiles() {
        const files = {
            input: path.join(mainPath, "input.txt").replace( /\\/g, '/' ),
            log: path.join(mainPath, "log.txt").replace( /\\/g, '/' ),
        };

        if(fs.existsSync(files.input)) fs.removeSync(files.input);
        if(fs.existsSync(files.log)) fs.removeSync(files.log); 
    }

    async *readOutputFolder() {
        try {
            const dir = await readdirAsync(outputPath);
            for (const file of dir) {
                yield file;
            }
        } catch(e) {
            throw new Error(e);
        }
    }

    async unzip() {

        const files = await this.readOutputFolder();

        for await (const file of files) {
            const realPath = path.join(outputPath, file);
            const unzipper = new DecompressZip(realPath);       

            if(fs.existsSync(realPath)) {
                unzipper.on('error', (err) => console.log(err));
                unzipper.on('extract', function (log) {
                    console.log('압축 해제를 완료하였습니다.');
                    fs.removeSync(realPath);
                });
                unzipper.on('progress', function (fileIndex, fileCount) {
                    console.log('압축 해제 중 : ' + (fileIndex + 1) + ' of ' + fileCount);
                });
                unzipper.extract({
                    path: path.join(outputPath),
                    filter: function (file) {
                        return file.type !== "SymbolicLink";
                    }
                });
            }

        }

    }

    async start() {

        try  {

            const files = await this.readOutputFolder();
            let isValidNW = false;

            for await (const file of files) {
                const realPath = path.join(outputPath, file).replace(/\\/g, "/");
                const stat = fs.lstatSync(realPath);
                if(stat.isDirectory()) {
                    let filename = path.join(realPath, 'nw.exe');
                    if(fs.existsSync(filename)) {
                        isValidNW = true;
                        console.log(`nw.exe를 찾았습니다.`)
                    }
                }
            }         
            
            if(isValidNW) {
                const NodeWebkit = require('./NW');

                const nwProcess = new NodeWebkit({
                    projectPath : `E:/Games/201907`, 
                    version: VERSION, 
                    outputPath: outputPath,
                }, function(err, stdout, stderr) {
                    if(err) {
                        console.log(err);
                        return;
                    }
                });

                nwProcess.onExit((code, signal) => {
                    console.log(`${Color.FgYellow}노드 웹킷 프로세스가 종료되었습니다.${Color.Reset}`);
                });
                
                nwProcess.pendingTerminate();

                return;
            }

            const version = VERSION;

            if(!version) {
                throw new Error(`버전 텍스트가 없습니다.`);
            }
    
            const needed_files = [
                `https://dl.nwjs.io/${version}/nwjs-sdk-${version}-win-x64.zip`,
                // `https://dl.nwjs.io/${version}/nwjs-${version}-win-x64.zip`,
                // `https://codeload.github.com/biud436/MV/zip/master`,
            ]
    
            if(this._isAria2c) {
    
                needed_files.forEach(line => {
                    this.processLine(line);
                });
        
                let outputRaw = this._output.join("\r\n");
        
                fs.writeFileSync(config.inputFile, outputRaw, "utf8");
        
                let header = {
                    referrer : config.referrer,
                    userAgent : config.userAgent,
                    inputFile : `${config.inputFile}`,
                    logFile : `${mainPath}/${config.logFile}`,
                };        
        
                // Create Aria2c
                let aria2cProcess = new Aria2c(header, function(err, stdout, stderr) {
                    if(err) {
                        console.log(err);
                        return;
                    }
                });
                    
                aria2cProcess.onExit((code, signal) => {
                    console.log(`${Color.FgRed}다운로드가 완료되었습니다${Color.Reset}`);
                    
                    this.removeFiles();
                    this.unzip();
                });
                
                aria2cProcess.pendingTerminate();   
    
            } else {
    
                if(!fs.existsSync(outputPath)) {
                    fs.mkdirSync(outputPath);
                }

                let functionTables = [];
                let counter = 0;

                needed_files.forEach(e => {
                    functionTables.push((callback) => {     
                        const fileUrl = needed_files[counter];
                        const filename = needed_files[counter++].splitOnLast("/");

                        console.log(`동시 다운로드 시작 : ${fileUrl}, ${filename}`);
                        fileGet.downFileZipAsync(fileUrl, path.join(outputPath, filename)).then(res => {
                            callback(null, fileUrl);
                        }).catch(err => {
                            callback(err, null);
                        });
                    });
                });

                async.parallel(functionTables, (err, results) => {
                    if(err) {
                        throw new Error(err);
                    }

                    console.log(`${Color.FgRed}다운로드가 완료되었습니다${Color.Reset}`);

                    this.unzip();
                });

            }

        } catch(e) {
            throw new Error(e);
        }

    }

}

let downloader = new Downloader();
downloader.start();

