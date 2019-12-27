const fs = require('fs');

class ColorUtil {

    constructor() {
        this.COLORS = JSON.parse(fs.readFileSync('./data/colors.json', 'utf8'));
    }

    //Extract rgba from SVG data
    //https://jsfiddle.net/subodhghulaxe/t568u/
    parseColors(data) {
        let r, g, b, a = -1;

        const fill = data.fill;
        const opacity = data.opacity;

        //its not there, let it be.
        if (!fill) {
            return [];
        }

        //its hex rgb -> parse
        if (fill.search('#') != -1) {
            return this.convertHex(fill, opacity);
        }

        //its rgba -> extract
        if (fill.search('rgba') != -1) {
            let rgba = fill.substring(5, fill.length - 1);
            rgba = rgba.split(',');

            rgba = rgba.map(v => {
                return parseFloat(parseFloat(v).toFixed(5))
            })

            return rgba;
        }

        //okay, so its a color name! -> convert to hex and go on
        const hex = this.colorNameToHex(fill);
        if (!hex) {
            return [];
        }

        return this.convertHex(hex, opacity);
    }

    convertHex(hex, opacity = 1) {
        const offset = 1 + Math.floor(hex.length / 6);
        const div = offset > 1 ? 255 : 15;
        let i = 1;

        const r = parseFloat((parseInt(hex.substring(i, i + offset), 16) / div).toFixed(5));
        i = i + offset;
        const g = parseFloat((parseInt(hex.substring(i, i + offset), 16) / div).toFixed(5));
        i = i + offset;
        const b = parseFloat((parseInt(hex.substring(i, i + offset), 16) / div).toFixed(5));

        return [r, g, b, opacity];
    }

    //get hex values from rgb color names
    //https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
    colorNameToHex(colour) {

        if (typeof this.COLORS[colour.toLowerCase()] != 'undefined')
            return this.COLORS[colour.toLowerCase()];

        return false;
    }
}

module.exports = ColorUtil;