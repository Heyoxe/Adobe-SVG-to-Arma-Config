const fs = require('fs');
const {parse} = require('svgson')

function Align(tabs) {
    let result = []
    for (let i = 0; i < tabs; i++) {
        result.push("\t")  
    }
    return result.join('')
}
   
function isGroup(data) {
    return ((data.name === 'g') ? true : false)
}

function ParseControls(data, tabs) {
    let result = []
    data.forEach(element => {
        if (isGroup(element)) {
            //console.log(`GROUP: ${element.attributes['data-name']}`)
            let group = [
                `\n${Align(tabs)}class ${element.attributes['data-name']} {\n`,
                `${Align(tabs + 1)}COOPR_FULLSCREEN{\n`,
                `${Align(tabs + 1)}class Controls {\n`,
                `${ParseControls(element.children, (tabs + 2))}`,
                `${Align(tabs + 1)}};\n`,
                `${Align(tabs)}};\n`
            ]
            result.push(group.join(''))
        } else if (element.attributes.id) {
            let Values = (Object.values(element.attributes))
            let regex = /([0-6000])\w+/g
            let Positions = [(((typeof (Values[4].match(regex)[0])) === "undefined") ? 0 : (Values[4].match(regex)[0])), (((typeof (Values[4].match(regex)[1])) === "undefined") ? 0 : (Values[4].match(regex)[1]))]
            let form = [
                `\n${Align(tabs)}class ${element.attributes['data-name']} {\n`,
                `${Align(tabs + 1)}COOPR_POSITION(${Positions[0]},${Positions[1]},${element.attributes.width},${element.attributes.height})\n`,
                `${Align(tabs)}};\n`
            ]
            result.push(form.join(''))
        }
    })
    return (result.join(''))
}

function ParseGUI(data) {
    let patfh = "3443"
    parse(data).then(object => {
        let Dialog = object.children[1].attributes.id
        let Config = [
            `class ${Dialog} {\n`,
            `${Align(1)} class Controls {\n`,
            `${ParseControls(object.children[1].children, 2)}`,
            `${Align(1)}};\n`,
            `};`
        ]

        let now = new Date().getTime()
        fs.writeFileSync(`${__dirname}/public/temp/__temp_${Dialog}_${now}.html`, `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title></head><body><pre>`, err => {
            if (err) throw err;
        })
        fs.appendFileSync(`${__dirname}/public/temp/__temp_${Dialog}_${now}.html`, Config.join(''))
        fs.appendFileSync(`${__dirname}/public/temp/__temp_${Dialog}_${now}.html`, `</pre></body></html>`)
        /*fs.writeFile(`__temp_${Dialog}.html`, Config.join(''), err => {
            if (err) throw err;
        })*/
        patfh = `/public/temp/__temp_${Dialog}_${now}.html`
        console.log(patfh)
    }).then(e => {
        console.log('end')
    })
}

//Careful, trash code below that line
const express = require('express')
console.log('Initializing Server and Network Listner...')
const app = express()
const server = require('http').createServer(app)

const ip = require("ip")
const port = 16224

const io = require('socket.io').listen(server)
server.listen(port)

console.log(`Server Started on ${ip.address()}:${port}`)

io.on('connection', function (socket) {
    socket.on('svg', function (data) {
        //ParseGUI(data)
        parse(data).then(object => {
            let Dialog = object.children[1].attributes.id
            let Config = [
                `class ${Dialog} {\n`,
                `${Align(1)} class Controls {\n`,
                `${ParseControls(object.children[1].children, 2)}`,
                `${Align(1)}};\n`,
                `};`
            ]
    
            let now = new Date().getTime()
            fs.writeFileSync(`${__dirname}/public/temp/__temp_${Dialog}_${now}.hpp`, Config.join(''), err => {
                if (err) throw err;
            })
            let path = `/public/temp/__temp_${Dialog}_${now}.hpp?${Dialog}`
            socket.emit('converted', path);
            /*fs.writeFile(`__temp_${Dialog}.html`, Config.join(''), err => {
                if (err) throw err;
            })*/
        })
    });
    socket.on('downloaded', data => {
        console.log('Yeh')
        fs.unlinkSync(`${__dirname}${data}`)
    })
});
//Routes (or whatever it's called)
console.log('Creating routes...')
app.get('*', (req, res) => {
    let url = req.params[0]
    if (url === '/') {
        const file = `${__dirname}/public/home.html`;
        res.sendFile(file, (err) => {
            if (err) {
                //res.sendFile(`${__dirname}/public/error.html`)
            }
        })
    } else if (url.startsWith('/public/temp')) {
        res.download(`${__dirname}${req._parsedUrl.pathname}`, `${req._parsedUrl.query}.hpp`, e => {
            fs.unlinkSync(`${__dirname}${req._parsedUrl.pathname}`)
        })
    } else {
        const file = `${__dirname}${req.originalUrl}`;
        res.sendFile(file, (err) => {
            if (err) {
                res.sendFile(`${__dirname}/public/error.html`)
            }
        })
    }
})

/*fs.readFile('CoopR_Supply_Dialog.svg', 'utf8', (err, fileContent) => {
    ParseGUI(fileContent)
})*/