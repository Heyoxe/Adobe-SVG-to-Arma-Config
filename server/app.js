function Align(tabs) {
    let result = new Array()
    for (let i = 0; i < tabs; i++) {
        result.push("\t")  
    }
    return result.join('')
}

//Transform SVG to JSON and return dimensions, id, name and all elements
function ExtractSVGData(svgraw) {
    let SVG = parseSync(svgraw)
    let ViewBox = SVG.attributes.viewBox.split(' ')
    let Dimensions = [
        ViewBox[2], 
        ViewBox[3]
    ]
    let Id = SVG.children[1].attributes.id
    let Name = Id.split(':')[0]
    let Forms = SVG.children[1].children
    return [Dimensions, Id, Name, Forms]
}

function isGroup(data) {
    return ((data.name === 'g') && (data.attributes.id))
}

function isRectangle(data) {
    return ((data.name === 'rect') && (data.attributes.id))
}

function isImage(data) {
    return ((data.name === 'image') && (data.attributes.id))
}

function isText(data) {
    return ((data.name === 'text') && (data.attributes.id))
}

function RelativePosition(controlPos, groupPos) {
    let x = controlPos[0] - groupPos[0]
    let y = controlPos[1] - groupPos[1]
    let w = controlPos[2]
    let h = controlPos[3]
    return [x, y, w, h]
}


//Generates Controls from elements
function ParseControls(forms) {
    let result = new Array()
    forms.forEach(item => {
        if (isGroup(item)) {
            let ControlClass = TransformClass(item.attributes.id)   
            let ControlPosition = new Array()
            let ControlChildrens = ParseControls(item.children)
            let ControlName = ControlClass.split(': ')[0]
            ControlChildrens.forEach(element => {
                ControlPosition.push(element[1])
            })

            ControlPosition = ([
                Math.round(getMinMaxOf2DIndex(ControlPosition, 0).min), 
                Math.round(getMinMaxOf2DIndex(ControlPosition, 1).min)
            ])
            
            let w = 0
            let h = 0
            //console.log(ControlPosition)
            ControlChildrens.forEach(element => {
                element.forEach(item => {
                    if (typeof item[0] === typeof 0) {
                        if (((item[0] - ControlPosition[0]) + item[2]) > w) {
                            w = (item[0] - ControlPosition[0]) + item[2]
                        }
                        if (((item[1] - ControlPosition[1]) + item[3]) > h) {
                            h = (item[1] - ControlPosition[1]) + item[3]
                        }
                    }
                })
            })
            ControlPosition.push(Math.round(w), Math.round(h))

            result.push([
                'GROUP',
                ControlClass, 
                ControlPosition, 
                ControlChildrens,
                ControlName
            ])
            ControlChildrens.forEach((element, index, array) => {
                let relativePosition = RelativePosition(element[1], ControlPosition)
                ControlChildrens[index][1] = relativePosition
            })
        } else if (isRectangle(item)) {
            let ControlClass = TransformClass(item.attributes.id)   
            let ControlPosition = ParsePositions(item.attributes)
            let ControlName = ControlClass.split(': ')[0]
            result.push([
                'RECT',
                ControlClass, 
                ControlPosition,
                ControlName
            ])
        } else if (isImage(item)) {
            let ControlClass = TransformClass(item.attributes.id)   
            let ControlPosition = ParsePositions(item.attributes)
            let ControlName = ControlClass.split(': ')[0]
            let ImagePath = item.attributes["xlink:href"]
            result.push([
                'IMAGE',
                ControlClass, 
                ControlPosition,
                ControlName,
                ImagePath
            ])           
        } else if (isText(item)) {
            console.log(item)
        } else {
            result.push(['ERR_NOT_SUPPORTED_TYPE'])
        }
    })
    return result
}

//Build main dialog control class
function BuildControls(data, addIDXs, rootIDX, useIDXsMacros, tabs, inGroup, groupName, tag, idxsList) {
    let result = new Array()
    let IDXList = new Array()
    IDXList = IDXList.concat(idxsList)
    data.forEach(element => {
        rootIDX += 1
        if (element[0] === 'RECT') {
            let Control = new Array(`${Align(tabs)}class ${element[1]} {`)
            if (addIDXs) {
                Control.push(`${Align(tabs + 1)}idc = ${(useIDXsMacros) ? tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[3] : rootIDX};`)
                if (useIDXsMacros) {
                    IDXList.push(`#define ${tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[3]} ${rootIDX}`)
                }
            }
            Control.push(`${Align(tabs + 1)}${tag}_POSITION${(inGroup) ? '_CT' : ''}(${element[2][0]},${element[2][1]},${element[2][2]},${element[2][3]})`)
            Control.push(`${Align(tabs)}};`)
            result.push(Control.join('\n'))
        } else if (element[0] === 'GROUP') {
            let Control = new Array(`${Align(tabs)}class ${element[1]} {`)
            if (addIDXs) {
                Control.push(`${Align(tabs + 1)}idc = ${(useIDXsMacros) ? tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[4] : rootIDX};`)
                if (useIDXsMacros) {
                    IDXList.push(`#define ${tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[4]} ${rootIDX}`)
                }
            }
            Control.push(`${Align(tabs + 1)}${tag}_POSITION${(inGroup) ? '_CT' : ''}(${element[2][0]},${element[2][1]},${element[2][2]},${element[2][3]})`)
            Control.push(`${Align(tabs + 1)}class Controls {`)
            Controls = BuildControls(element[3], addIDXs, rootIDX, useIDXsMacros, tabs + 2, true, element[5], tag, [])
            rootIDX = Controls[1]
            IDXList = IDXList.concat(Controls[2])
            Control.push(Controls[0].join(`\n`))
            Control.push(`${Align(tabs + 1)}};`)
            Control.push(`${Align(tabs)}};`)
            result.push(Control.join('\n'))
        } else if (element[0] === 'IMAGE') {
            let Control = new Array(`${Align(tabs)}class ${element[1]} {`)
            if (addIDXs) {
                Control.push(`${Align(tabs + 1)}idc = ${(useIDXsMacros) ? tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[3] : rootIDX};`)
                if (useIDXsMacros) {
                    IDXList.push(`#define ${tag + '_IDC_' +  ((inGroup) ? groupName + '_' : '') + element[3]} ${rootIDX}`)
                }
            }
            Control.push(`${Align(tabs + 1)}${tag}_POSITION${(inGroup) ? '_CT' : ''}(${element[2][0]},${element[2][1]},${element[2][2]},${element[2][3]})`)
            Control.push(`${Align(tabs + 1)}text = "${element[4]}";`)
            Control.push(`${Align(tabs)}};`)
            result.push(Control.join('\n'))
        } else if (element[0] === 'TEXT') {

        }
    })
    return [result, rootIDX, IDXList]
}


//Generates GUI's "Elements"
function ParseGUI(svgraw, time) {
    let SVGData = ExtractSVGData(svgraw)
    if (SVGData[0].toString() !== ['1920', '1080'].toString()) {
        return 'ERR_NOT_SUPPORTED_ASPECT_RATIO'
    } else {
        let Credits = [
            `Generated with XD2A3 (xd2a3.heyoxe.ch) on %NOW%`,
            ``,
            `GitHub Repository: https://github.com/Heyoxe/Adobe-SVG-to-Arma-Config`,
            `Forum Thread: https://forums.bohemia.net/forums/topic/225459-adobe-xd-to-arma-3-convert-your-adobe-xd-guis-to-arma-3-sort-of/`,
            `Discord: https://discord.gg/QDGatN2`,
            `Website: http://xd2a3.heyoxe.ch/`,
            `Licence: CC/BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)`
        ]
        let Header = [
            `#define %TAG%_POSITION(X,Y,W,H) \\`,
            `${Align(1)}x = #((((X * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0) + safeZoneX); \\`,
            `${Align(1)}y = #((((Y * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1) + safeZoneY); \\`,
            `${Align(1)}w = #((((W * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0)); \\`,
            `${Align(1)}h = #((((H * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1));`,
            ``,
            `#define %TAG%_POSITION_CT(X,Y,W,H) \\`,
            `${Align(1)}x = #((((X * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0)); \\`,
            `${Align(1)}y = #((((Y * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1)); \\`,
            `${Align(1)}w = #((((W * (getResolution select 0)) / 1920) * safeZoneW) / (getResolution select 0)); \\`,
            `${Align(1)}h = #((((H * (getResolution select 1)) / 1080) * safeZoneH) / (getResolution select 1));`,          
        ]
        let DialogClass = TransformClass(SVGData[1])
        let DialogName = TransformClass(SVGData[1]).split(' ')[0]
        let Controls = ParseControls(SVGData[3])  
        return [DialogName, Credits, Header, DialogClass, Controls]
    }
}

//Transform "ID" to "Classname"
function TransformClass(data) {
    if (data.includes(':_')) {
        return data.replace(':_', ': ')
    } else {
        return data
    }
}

//Extract Positions from "translate(X Y)"
function ParsePositions(data) {
    let x = (data.transform) ? Number(data.transform.replace('translate(', '').replace(')', '').split(' ')[0]) : 0
    let y = (data.transform) ? Number(data.transform.replace('translate(', '').replace(')', '').split(' ')[1]) : 0
    let w = (data.width) ? Number(data.width) : 0
    let h = (data.height) ? Number(data.height) : 0
    return [Math.round(x), Math.round(y), Math.round(w), Math.round(h)]
}

//https://stackoverflow.com/a/23398499
function getMinMaxOf2DIndex(arr, idx) {
    return {
        min: Math.min.apply(null, arr.map(function (e) { return e[idx]})),
        max: Math.max.apply(null, arr.map(function (e) { return e[idx]}))
    }
}

//Build the final GUI
function BuildGUI(data, addCredits, addDefines, definesTag, addIDXs, rootIDX, useIDXsMacros, separateIDXsMacros) {
    let time = new Date().getTime()
    let timeReadable = new Date(time).toUTCString()
    let Render = new Array()
    let IDXsList = new Array()

    if (addCredits) {
        let Credits = new Array('/*')
        data[1].forEach(element => {
            Credits.push(` * ${element}`)
        }) 
        Credits.push(` */`, '')
        Credits = Credits.join('\n').replace('%NOW%', timeReadable)
        Render.push(Credits)
    }

    let Controls = BuildControls(data[4], addIDXs, rootIDX - 1, useIDXsMacros, 2, false, '', definesTag, [])
    if (addIDXs) {
        if (useIDXsMacros) {
            if (separateIDXsMacros) {
                Render.push(`/* Includes */`)
                Render.push(`#include "IDXs.hpp"`, ``)
                Controls[2].splice(0, 0, `#define ${definesTag}_IDD_${data[0]} ${rootIDX}`)
                IDXsList.push(Controls[2].join(`\n`))
            } else {
                Render.push(`/* IDD/IDCs Macros */`)
                Controls[2].splice(0, 0, `#define ${definesTag}_IDD_${data[0]} ${rootIDX}`)
                Controls[2].push('')
                Render.push(Controls[2].join(`\n`))
            }
            //rootIDX = `${definesTag}_IDD_${data[0].substring(0, data[0].length - 1)}`
            rootIDX = `${definesTag}_IDD_${data[0]}`
        }
    } else {
        rootIDX = -1
    }

    if (addDefines) {
        Render.push(`/* Positions Macros */`, `//Macros by Heyoxe (https://steamcommunity.com/id/Heyoxe/). Former TAG was EBA_`)
        let Defines = new Array()
        data[2].forEach(element => {
            Defines.push(element)
        }) 
        Defines.push('')
        Defines = Defines.join('\n').replace(/%TAG%(?=_POSITION)/g, definesTag)
        Render.push(Defines)        
    }


    let Dialog = [
        `class ${data[3]} {`,
        `${Align(1)}idd = ${rootIDX};`,
        `${Align(1)}class Controls {`,
        `${Controls[0].join('\n')}`,
        `${Align(1)}};`,
        `};`
    ]
    Render.push(Dialog.join('\n'))  

    return [Render.join('\n'), IDXsList, time]
}



/*
 * 
 * Server Code
 * 
 */
const fs = require('fs');
const {parseSync} = require('svgson')


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
    socket.on('svg', (data, addCredits, addDefines, definesTag, addIDXs, useIDXsMacros, rootIDX, separateIDXsMacros) => {
        //ParseGUI(data)[4]
        let time = new Date().getTime()
        try {
            let parsedGUI = ParseGUI(data, time)
            let result = BuildGUI(parsedGUI, addCredits, addDefines, definesTag, addIDXs, rootIDX, useIDXsMacros, separateIDXsMacros)
            let DialogContent = result[0]
            let Dialog = parsedGUI[0]
            let IDXsList = result[1][0]
            if (separateIDXsMacros) {
                socket.emit('converted', [IDXsList, 'IDXs.hpp']);
            }
            socket.emit('converted', [DialogContent, `${Dialog}.hpp`]);
        } catch {}
    })
})



//Routes (or whatever it's called)
console.log('Creating routes...')
app.get('*', (req, res) => {
    let url = req.params[0]
    if (url === '/') {
        const file = `${__dirname}/public/home.html`;
        res.sendFile(file, (err) => {
            if (err) {
                res.sendFile(`${__dirname}/public/error.html`)
            }
        })
    } else if (url === '/exporter') {
        const file = `${__dirname}/public/exporter.html`;
        res.sendFile(file, (err) => {
            if (err) {
                res.sendFile(`${__dirname}/public/error.html`)
            }
        })       
    } else if (url === '/error') {
            res.sendFile(`${__dirname}/public/error.html`)
    } else {
        const file = `${__dirname}${req.originalUrl}`;
        res.sendFile(file, (err) => {
            if (err) {
                res.sendFile(`${__dirname}/public/error.html`)
            }
        })
    }
})