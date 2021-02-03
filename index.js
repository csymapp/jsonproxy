const axios = require('axios')
const to = require('await-to-js').to
const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors())


app.get('/', async (req, res) => {
    let url = req.query.path
    let headers = {}
    if (req.headers["Content-Type"]) headers['Content-Type'] = req.headers["Content-Type"]
    if (req.headers["X-Authorization"]) headers['X-Authorization'] = req.headers["X-Authorization"]
    if (req.headers["x-authorization"]) headers['X-Authorization'] = req.headers["x-authorization"]
    let [err, care] = await to(axios.get(url, {
        headers
    }));
    if (err) {
        return res.json({})
    }
    return res.json({ result: care.data })
});

let server = app.listen(9230, function () {
    console.log('Express HTTP server listening on port ' + server.address().port);
});