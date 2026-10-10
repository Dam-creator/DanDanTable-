// Local static preview; backend source, Git metadata and tests are never served.
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),port=Number(process.env.PORT || 4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'};
http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  if(pathname==='/')pathname='/index.html';
  if(!/^\/(?:index\.html$|(?:assets|css)\/)/.test(pathname)){res.writeHead(404);return res.end();}
  const target=path.resolve(root,'.'+pathname);
  if(!target.startsWith(root+path.sep)){res.writeHead(404);return res.end();}
  fs.stat(target,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404);return res.end();}
    res.writeHead(200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store'});
    if(req.method==='HEAD')return res.end();
    const stream=fs.createReadStream(target);stream.on('error',()=>res.destroy());stream.pipe(res);
  });
}).listen(port,'127.0.0.1',()=>console.log('DanDanTable A1 preview: http://127.0.0.1:'+port));
