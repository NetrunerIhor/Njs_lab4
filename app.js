const express = require("express");
const fs = require('fs');
const os = require('os');
const zlib = require('zlib');
const server = express();


server.get( ["/home",'/'],(request,response) =>{
    response.sendFile(__dirname + "/home.html")
});
server.get('/about',(request,response) =>{
    response.sendFile(__dirname + "/about.html")
});
server.get('/getdata',(request,response) =>{
    let now = Date.now();
    let timestamp = new Date(now).toISOString();
    let user = os.userInfo().username;
    let data = {
        date: timestamp,
        user: user
    };
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
});
server.get('/myfile',(request,response) =>{
    // var fileData = "data error";
    fs.readFile('./myfile.txt',(error,fileData) =>{
        if(error){
            response.sendStatus(500);
        }
        fs.readFile(__dirname + '/myfile.html', (error, data) => {
            if (error) {
                response.sendStatus(500);
            } else {
                const htmlText = data.toString().replace(/{fileData}/g, fileData);
                response.send(htmlText);
            }
        });
    });
    
});
server.get('/mydownload',(request,response) =>{
    fs.access('./myfile2.txt',(error)=>{
        if(error){
            response.sendStatus(500)
            console.log(500)
        }
        else{
              response.download('./myfile2.txt');
        }
    })
});
server.get('/myarchive',(request,response) =>{
    fs.access('./myfile.txt',(error)=>{
        if(error){
            response.sendStatus(500);
            console.log(0)
        }
        else{
            fs.readFile("./myfile.txt",(error,data)=>{
                if(error){
                    response.sendStatus(500);
                    console.log(1)
                }
                else{
                    zlib.gzip(data,(error,compressedData)=>{
                        if(error){
                            response.sendStatus(500);
                            console.log(2)
                        }
                        else{//тимчасовий файл для скачування стиснутих даних "compressedData"
                            const tempFilePath = __dirname + "/tempFile.txt.gz";
                            fs.writeFile(tempFilePath,compressedData,(error)=>{
                                if(error){
                                    response.sendStatus(500);
                                    console.log(3)
                                    console.log(error)
                                }
                                else{
                                    response.download(tempFilePath,"myfile.txt.gz",(error)=>{
                                        if(error){
                                            response.sendStatus(500);
                                            console.log(4)
                                        };
                                        fs.unlink(tempFilePath, (error) => {
                                            if (error) {
                                                console.error('Failed to delete temporary file:', error);
                                            }
                                        });
                                    
                                    });
                                }
                            });
                            
                        };
                    });
                }
            });
        }
    })
});

server.get("*",(_,response) =>{
    response.status(404).send("«There is no such resource».");
});
server.listen(3000);
