const { Octokit } = require("@octokit/rest");
const axios = require('axios')
const to = require('await-to-js').to
const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json());

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

app.post('/savetogithub', async (req, res) => {
    let gitkey = req.body.gitkey
    const octokit = new Octokit({
        auth: gitkey,
    });
    let [err, care] = await to(
        // axios.get(`https://api.github.com/repos/${req.body.owner}/${req.body.repo}/contents/${req.body.path}`)

        octokit.request(`GET /repos/${req.body.owner}/${req.body.repo}/contents/${req.body.path}`, {
            owner: req.body.owner,
            repo: req.body.repo,
            path: req.body.path
        })
    );
    let sha;
    if (!err) {
        sha = care.data.sha
    }
    let obj = {
        owner: req.body.owner,
        repo: req.body.repo,
        path: req.body.path,
        message: req.body.message,
        content: Buffer.from(typeof req.body.content === 'object'?JSON.stringify(req.body.content):req.body.content).toString("base64"),
    }
    if(sha){
        obj.sha = sha
    };
    [err, care] = await to(
        octokit.request(
            // `PUT ${req.body.path}`, {
            `PUT /repos/${req.body.owner}/${req.body.repo}/contents/${req.body.path}`, obj
        )
    );
    if(err){
        return res.json(err.data)
    }
    res.json(care.data)
});
app.post('/readfromgithub', async (req, res) => {
    let gitkey = req.body.gitkey
    const octokit = new Octokit({
        auth: gitkey,
    });
    let [err, care] = await to(
        octokit.request(`GET /repos/${req.body.owner}/${req.body.repo}/contents/${req.body.path}`, {
            owner: req.body.owner,
            repo: req.body.repo,
            path: req.body.path
        })
    );
    // let sha;
    if (err) {
        return res.status(500).send({err})
    }

    let content = atob(care.data.content);
    try{
        content = JSON.parse(content)
        res.json(content)
    }catch(err){
        res.send(content)
    }
    res.json(content)
});

app.delete('/deleteFromTb', async (req, res) => {
    let url = req.query.path
    let headers = {}
    if (req.headers["Content-Type"]) headers['Content-Type'] = req.headers["Content-Type"]
    if (req.headers["X-Authorization"]) headers['X-Authorization'] = req.headers["X-Authorization"]
    if (req.headers["x-authorization"]) headers['X-Authorization'] = req.headers["x-authorization"]
    let params = req.query;
    delete params.path;
    for(let key in params){
        url += `&${key}=${params[key]}`
    }
    let [err, care] = await to(axios.delete(url, {
        headers
    }));
    
    if (err) {
        // console.log(err)
        return res.json({})
    }
    return res.json({ result: care.data || 'Empty' })
});

let server = app.listen(9230, function () {
    console.log('Express HTTP server listening on port ' + server.address().port);
});