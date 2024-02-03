/* const http = require('http');
http.createServer(function(request, response){
    console.log(request.url);
    console.log(request.method);


    response.setHeader("Content-Type", "text/html; charset=utf-8")
    if(request.url == '/'){
        response.end('Main <b>hello</b> Привет');
        }
    else if(request.url == '/cat'){
        response.end('Categoty <h2>hello</h2> Категория');
    }
}).listen(3000); */