const http = require('http');

http.get('http://localhost:5000/recommendations/similar/6a58ebc2fb251ddb03fe4c68', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log("Response:", data); });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
