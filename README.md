# Adobe-SVG-to-Arma-Config
[![GitHub issues](https://img.shields.io/github/issues/Heyoxe/Adobe-SVG-to-Arma-Config?style=flat-square)](https://github.com/Heyoxe/Adobe-SVG-to-Arma-Config/issues) [![GitHub forks](https://img.shields.io/github/forks/Heyoxe/Adobe-SVG-to-Arma-Config?style=flat-square)](https://github.com/Heyoxe/Adobe-SVG-to-Arma-Config/network) [![GitHub stars](https://img.shields.io/github/stars/Heyoxe/Adobe-SVG-to-Arma-Config?style=flat-square)](https://github.com/Heyoxe/Adobe-SVG-to-Arma-Config/stargazers) [![Discord Server](https://img.shields.io/static/v1?label=Discord&message=Join&color=7289DA&style=flat-square&logo=Discord&logoColor=white&link=https://discord.gg/QDGatN2)](https://discord.gg/QDGatN2) [![Licence](https://img.shields.io/static/v1?label=licence&message=CC%2FBY-NC-SA%204.0&color=3a91db&style=flat-square)](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
#### Create your GUIs in Adobe XD, export them as SVGs, use them in Arma 3

### Limitations
1.	XD2A3 **will not** accept Artboards format other than **1920x1080**
2.	XD2A3 **will not** export elements other than **Rectangles** or **Groups**
3.	XD2A3 **will not** export your GUI if you don't name your elements (that's more related to the way that Adobe XD works)

	**How do I know if my SVG is not compatible?** If you upload it and nothing happens, it's not. If you think that you've followed all the steps correctly, please open an Issue on GitHub
------------
### How to use it
1.	Build your GUI in Adobe XD, don’t forget, only Groups and Rectangles will be rendered in the generated Config.
2.	The name of the Element will be the value used for the class in the Dialog. 
For example:
	- **Element (Rectangle) name: XD2A3_myWonderFullButton: RscButton**
	- **In the Dialog:**
	```CPP
	Class XD2A3_myWonderFullButton: RscButton {
			//[…]
	};
	```
	[![](https://i.imgur.com/hPEbVyG.jpg)](https://i.imgur.com/hPEbVyG.jpg)
	**Note**: The Artboards name will be used for the Dialogs name.

3.	Export your Selected Artboard with the following Options:
	- **Format**: SVG
	- **Styling**: Presentation Attributes
	- **Save images**: Embed OR Link
	- **File size**: Normal (do not check)
4.	Go to [XD2A3 Website](http://xd2a3.heyoxe.ch/ "XD2A3 Website").
5.	Select your options:
[![](https://i.imgur.com/jiRYsSL.jpg)](https://i.imgur.com/jiRYsSL.jpg)

6.	Select your file. Once selected, wait until the Download pop-up shows up.
7.	If you have selected Separate IDD/IDCs Macros in another file, you will have to files:
	One will contain your Dialog, the other one will contain the IDXs Macros so you can easily import them into your scripts.

8.	Congratulation, you now have a Dialog that can be added to any mod/missions. Be sure to adjust path if you need to.
------------
### Dependecies:
- express
- socket.io
- svgson
- ip
- node

### Default Port: 16224
