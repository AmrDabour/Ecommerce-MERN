const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const localFile = path.join(__dirname, 'AI', 'services', 'recommendations', 'embeddings.py');
const remoteFile = '/root/MEAN/AI/services/recommendations/embeddings.py';

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('Upload complete');
      
      const script = `
        cd /root/MEAN
        docker compose restart ai celery_worker
      `;
      
      console.log('Executing restart command...');
      conn.exec(script, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
          console.log('Done with code:', code);
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
        });
      });
    });
  });
}).connect({
  host: '95.217.58.75',
  port: 22,
  username: 'root',
  password: 'z7WkuJfJrPSgWV'
});
