/*globals define*/
var self;
define([
	"qlik",
	"jquery", 
    "./d3", 
    "./chroma", 
    "./svgOptions", 
    "./svgFunctions", 
    "./senseUtils"
], function (qlik, $, d3, chroma) {
    'use strict';

	//get baseUrl of extension assets so css and svg can be loaded correctly in both client and mashup
	var baseUrl = typeof config !== "undefined" ? (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix : "";

	//load css here so that mashups without require.js text extension loaded still work
	$.get(baseUrl + (baseUrl.slice(-1) === "/" ? "" : "/") + "Extensions/svgReader/style.css", function(cssContent) {
	   	$( "<style>" ).html( cssContent ).appendTo( "head" );
	});

	var panelSliderLabel = function () {
		return this.labelText + " (" + (arguments[0][this.ref] || this.defaultValue) + ")";
	};

	return {
		initialProperties: {
			version: 1.0,
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 4,
					qHeight: 2500
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 2
				},
				measures: {
					uses: "measures",
					min: 1,
					max: 2
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings",
					type: "items",
					items: {
						svgGroup: {
							label: "SVG Settings",
							type: "items",
							items: {
								SVGDropDown: {
									type: "string",
									component: "dropdown",
									label: "SVG Map",
									ref: "svg",
									options: svg_options,
									defaultValue: 1
								},
								SVGCustomAbsolute: {
                                    type: "boolean",
                                    label: "Absolute path",
                                    ref: "loadSVGAbsolute",
                                    defaultValue: false,
									show: function (data) {
                                        if (data.svg == "custom") { //if custom svg is selected, then display this box
                                            return true;
                                        } else {
                                            return false;
                                        }

                                    }
                                },
								SVGCustom: {
									ref: "loadSVG",
									label: "Custom SVG Name",
									type: "string",
								  expression:"optional",
									defaultValue: "none",
									show: function (data) {
										if (data.svg == "custom") { //if custom svg is selected, then display this box
											return true;
										} else {
											return false;
										}
									}
								},
								SVGCustomVar: {
									type: "boolean",
									label: "Treat Custom SVG as Variable",
									ref: "customVar",
									defaultValue: false,
									show: function (data) {
										if (data.svg == "custom") { //if custom svg is selected, then display this box
											return true;
										} else {
											return false;
										}
									}
								},
								SVGBorders: {
									type: "boolean",
									label: "Show element borders",
									ref: "showBorders",
									defaultValue: false
								},
								textOption: {
									type: "boolean",
									label: "Show SVG Text",
									ref: "showText",
									defaultValue: false
								}, 
								showMeasure: {
									type: "boolean",
									label: "Show Measure",
									ref: "showMeasure",
									defaultValue: false,
									show: function(data) {
										return data.showText;
									}
								},
								measureFontSize: {
									ref: "measureFontSize",
									type: "number",
									component: "slider",
									labelText: "Measure Font Size",
									label: panelSliderLabel,
									min: 0.4,
									max: 60,
									step: 0.2,
									defaultValue: 6
								},
								measureCustColor: {
									type: "boolean",
									label: "Custom Measure Color",
									ref: "measureCustColor",
									defaultValue: false,
									show: function(data) {
										return data.showText && data.showMeasure;
									}
								},
								measureColor: {
									component: "color-picker",
									label: "Hot Color",
									ref: "measureColor",
									type: "object",
									dualOutput: true,
									defaultValue: {
										color: "#7db8da"
									},
									show: function (data) {
										return data.showText && data.showMeasure && data.measureCustColor;
									}
								},
								hideRotationArrows: {
									type: "boolean",
									label: "Hide Rotation Arrows",
									ref: "hideRotation",
									defaultValue: true // feature doesn't work atm
								}, 
								scrollable: {
									type: "boolean",
									label: "Scrollable",
									ref: "scrollable",
									defaultValue: false
								}, 
								zoomMin:{
									ref: "zoommin",
									label: "Min Zoom",
									type: "number",
									defaultValue: 0.5
								}, 
								zoomMax:{
									ref: "zoommax",
									label: "Max Zoom",
									type: "number",
									defaultValue: 10
								}
							}
						},
						colorGroup: {
							label: "Color Settings",
							type: "items",
							items: {
								TypeColor:{
									label: "Color Type",
									type: "boolean",
									component: "switch",
									options: [
										{
											label: "By measure",
											value: false
										}, {
											label: "By dimension",
											value: true
										}],
									ref: "colorType",
									defaultValue: false
								},
								//////////////// BY MEASURE ////////////////
								OnlyOneMeasure: {
									label: "Color Calculation",
									type: "boolean",
									component: "switch",
									options: [
										{
											label: "Use First",
											value: true
										}, {
											label: "Use Second (color expression)",
											value: false
										}],
									ref: "onlyonemeasure",
									defaultValue: false,
									show: function (data) {
                                        if(data.colorType){
                                            return false;
                                        }
										else{
											if (data.qHyperCubeDef.qMeasures.length > 1) { //if a color measure is added don't display this property
												return true;
											}else{
												return false;
											}
										}
                                    }
								},
								DisColor: {
									component: "color-picker",
									label: "Disabled Color",
									ref: "disColor",
									type: "object",
									dualOutput: true,
									defaultValue: {
										color: "#d2d2d2"
									},
									show: function (data) {
										if(data.colorType){
											return false;
										}
										else{
											if (!data.onlyonemeasure && data.qHyperCubeDef.qMeasures.length > 1) { //if a color measure is added don't display this property
												return false;
											}
											else{
												return true;
											}
										}
									}
								},
								HotColor: {
									component: "color-picker",
									label: "Hot Color",
									ref: "hotColor",
									type: "object",
									dualOutput: true,
									defaultValue: {
										color: "#AE1C3E"
									},
									show: function (data) {
										if(data.colorType){
											return false;
										}
										else{
											if (!data.onlyonemeasure && data.qHyperCubeDef.qMeasures.length > 1) { //if a color measure is added don't display this property
												return false;
											}
											else{
												return true;
											}
										}
									}
								},
								ColdColor: {
									component: "color-picker",
									label: "Base (Cold) Color",
									ref: "coldColor",
									type: "object",
									dualOutput: true,
									defaultValue: {
										color: "#3D52A1"
									},
									show: function (data) {
										if(data.colorType){
											return false;
										}
										else{
											if (!data.onlyonemeasure && data.qHyperCubeDef.qMeasures.length > 1) { //if a color measure is added don't display this property
											}
											else{
												return true;
											}
										}
									}
								},
								HotColorCustom: {
									type: "string",
									label: 'Custom Hex Color for Hot',
									ref: 'hotColorCustom',
									show: function (data) {
										if(data.colorType){
											return false;
										}
										else{
											if (!data.onlyonemeasure && data.qHyperCubeDef.qMeasures.length > 1) { //if a color measure is added don't display this property
												return false;
											}
											else{
												return true;
											}
										}
									},
									defaultValue: ''
							    },
								ColdColorCustom: {
									type: "string",
									label: 'Custom Hex Color for Cold',
									ref: 'coldColorCustom',
									show: function (data) {
										if(data.colorType){
											return false;
										}
										else{
											if (!data.onlyonemeasure && data.qHyperCubeDef.qMeasures.length > 1) { //if a color measure is added don't display this property
												return false;
											}
											else{
												return true;
											}
										}
									},
									defaultValue: ''
								},
								colorOpacity: {
									ref: "colorOpacity",
									type: "number",
									component: "slider",
									labelText: "Opacity",
									label: panelSliderLabel,
									min: 0.4, // above selection opacity 0.3 (unselected shapes, class qv-selection-active)
									max: 1,
									step: 0.02,
									defaultValue: 1
								},
								//////////////// BY DIMENSION ////////////////
								OnlyOneDimension: {
                                    //type: "boolean",
                                    //label: "Only first dimension",
                                    //ref: "onlyonedimension",
                                    //defaultValue: false,
									//show: function (data) {
                                    //    if (data.colorType) { 
                                    //        if (data.qHyperCubeDef.qDimensions.length > 1) {
									//			return true;
									//		}else{
									//			return false;
									//		}
                                    //    } else {
                                    //        return false;
                                    //    }
                                    //
                                    //}
									label: "Color Dimension",
									type: "boolean",
									component: "switch",
									options: [
										{
											label: "Second Dimension",
											value: false
										}, {
											label: "First Dimension",
											value: true
										}],
									ref: "onlyonedimension",
									defaultValue: true,
									show: function (data) {
                                        if (data.colorType) { 
                                            if (data.qHyperCubeDef.qDimensions.length > 1) {
												return true;
											}else{
												return false;
											}
                                        } else {
                                            return false;
                                        }
                                
                                    }
                                }
							}
						},
						popupGroup: {
								label: "Pop-up Settings",
								type: "items",
								items: {
									displayPop: {
										label: "Show Pop-up",
										type: "boolean",
										component: "switch",
										options: [
											{
												label: "Off",
												value: false
											}, {
												label: "On",
												value: true
											}],
										ref: "popupDisplay", //"pop",
										defaultValue: true
									},
									displayCustomPop: {
										type: "boolean",
										label: "Custom Pop-up",
										ref: "popupCustom",
										defaultValue: false
									},
									displayTitle: {
										label: "Show Title",
										type: "boolean",
										component: "switch",
										options: [
											{
												label: "Off",
												value: false
											}, {
												label: "On",
												value: true
											}],
										ref: "popupDisplaytitle",
										defaultValue: false,
										// hide if 'd.popupDisplay' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom;
										}
									},
									titlePop:{
										type: "string",
										label: "Title",
										ref: "popupTitle", //"poptitle",
										expression: "optional",
										defaultValue: "My Title",
										// hide if 'd.popupDisplay' OR 'popupDisplay.title' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom && d.popupDisplaytitle;
										}
									},
									titleColorPop:{
										type: "string",
										label: "Title Color",
										ref: "popupTitlecolor",
										expression: "optional",
										defaultValue: "0,0,0",
										// hide if 'd.popupDisplay' OR 'popupDisplay.title' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom && d.popupDisplaytitle;
										}
									},
									displayMeasures: {
										label: "Show Measure",
										type: "boolean",
										component: "switch",
										options: [
											{
												label: "Off",
												value: false
											}, {
												label: "On",
												value: true
											}],
										ref: "popupMeasures", //"popmeasures",
										defaultValue: true,
										// hide if 'd.popupDisplay' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom;
										}
									},
									displayMeasuresLabel: {
										type: "boolean",
										label: "Show Measure Label",
										ref: "popupMeasureslabel",
										defaultValue: true,
										show: function (d) {
											return d.popupDisplay && d.popupCustom && d.popupMeasures;
										}
									},
									measuresColorPop:{
										type: "string",
										label: "Measure Color",
										ref: "popupMeasurescolor",
										expression: "optional",
										defaultValue: "0,0,0",
										// hide if 'd.popupDisplay' OR 'popupDisplay.title' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom && d.popupMeasures;
										}
									},
									displayAddContent: {
										label: "Show Additional Content",
										type: "boolean",
										component: "switch",
										options: [
											{
												label: "Off",
												value: false
											}, {
												label: "On",
												value: true
											}],
										ref: "popupDisplayaddcontent",
										defaultValue: true,
										// hide if 'd.popupDisplay' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom;
										}
									},
									contentPop:{
										type: "string",
										label: "Content (html)",
										ref: "popupAddcontent", //"prop.popcontent",
										expression: "optional",
										defaultValue: "",
										// hide if 'd.popupDisplay' OR 'popupDisplayaddcontent' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom && d.popupDisplayaddcontent;
										}
									},
									backgroundColor:{
										type: "string",
										label: "Background Color",
										ref: "popupBackgroundcolor", 
										expression: "optional",
										defaultValue: "255,255,255",
										// hide if 'd.popupDisplay' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom;
										}
									},
									backgroundAlpha: {
										type: "integer",
										label: "Background Opacity",
										ref: "popupBackgroundopacity",
										defaultValue: 8,
										component: "slider",
										min: 0,
										max: 10,
										step: 1,
										// hide if 'd.popupDisplay' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom;
										}
									},
									displayBorder: {
										label: "Show Border",
										type: "boolean",
										component: "switch",
										options: [
											{
												label: "Off",
												value: false
											}, {
												label: "On",
												value: true
											}],
										ref: "popupDisplayborder",
										defaultValue: true,
										// hide if 'd.popupDisplay' unchecked
										show: function (d) {
											return d.popupDisplay && d.popupCustom;
										}
									}
								}
							}
						
					}
				}
			}
		},
		support: {
			snapshot: true,
			export: true,
			exportData: true
		},
		updateData: function(layout){
			var app = qlik.currApp(this);
			return new qlik.Promise(function(resolve){
				return app.theme.getApplied().then(function(res){
					layout.Theme = res;
					resolve(layout);
				});
			});
		},
		paint: function($element, layout){
			var self = this,
				h = $element.height(),
				w = $element.width(),
				extID = layout.qInfo.qId,
				numDim = layout.qHyperCube.qDimensionInfo.length,
				Theme = layout.Theme.properties,
				resolvePrint,
				scope = $element.scope();

			$element.parents("div.qv-object-content-container").css("overflow", layout.scrollable ? "auto" : "");

			senseUtils.pageExtensionData(self, $element, layout, function ($element, layout, fullMatrix, me) { //function that pages the full data set and returns a big hypercube with all of the data
				// fix for sheetobjects with old color-picker
				//console.log(layout.disColor, layout.hotColor, layout.coldColor);
				function translateColor(prop, alt) {
					var colorPickerOldPalette = ["#b0afae", "#7b7a78", "#545352", "#4477aa", "#7db8da", "#b6d7ea", "#46c646", "#f93f17", "#ffcf02", "#276e27", "#ffffff", "#000000"];
					var ret = "#d2d2d2";
					if (prop !== 'undefined') {
						if (typeof prop === 'number' && prop >= 0 && prop <= 12) {
							ret = colorPickerOldPalette[prop];
						} else if (typeof prop === 'string') {
							ret = prop;
						} else if (typeof prop === 'object' && prop.hasOwnProperty("color")) {
							ret = prop.color;
						}
					} else {
						if (alt !== 'undefined' && typeof alt === 'string' && alt !== '') {
							ret = alt;
						}
					}
					return ret;
				}
				function translateColor2(cust, prop, alt) {
					if (cust !== 'undefined' && typeof cust === 'string' && cust !== '') {
						return cust;
					} else {
						return translateColor(prop, alt);
					}
				}
				//load the properties into variables
				var disColor = translateColor(layout.disColor,  Theme.dataColors.nullColor);
				var hotColor = translateColor2(layout.hotColorCustom, layout.hotColor, "#AE1C3E");
				var coldColor = translateColor2(layout.coldColorCustom, layout.coldColor, "#3D52A1");
				console.log(disColor, hotColor, coldColor);
				
				var customSVG = layout.loadSVG,
					showText = layout.showText,
					showMeasure = layout.showMeasure,
					measureFontSize = layout.measureFontSize || 6,
					measureCustColor = layout.measureCustColor,
					measureColor = layout.measureColor;

				// treat new property
				layout.popupDisplay = typeof layout.popupDisplay === 'undefined' ? true : layout.popupDisplay;

				//empty out the extension in order to redraw.  in the future it would be good to not have to redraw the svg but simply re-color it
				$element.empty();
				//arrJ is an object that holds all of the relevant data coming from sense that we can match against the SVG
				var arrJ = {};
				//colEx determines if a color measure is added
				var colEx = false;
				// more than one measure
				if (!layout.onlyonemeasure && layout.qHyperCube.qMeasureInfo.length > 1) {
					colEx = true;
				}
				var maxVal = layout.qHyperCube.qMeasureInfo[0].qMax;
				var minVal = layout.qHyperCube.qMeasureInfo[0].qMin;
				//set up the color scale
				var vizScale = chroma.scale([coldColor, hotColor]);
				//iterate through the data and put it into arrJ. this JSON is the same format as the data attached to the SVG elements
				var cpt = 0;
				var maxDim, colorScale = [];
				
				if(numDim==1 || layout.onlyonedimension){
					maxDim = layout.qHyperCube.qDimensionInfo[0].qCardinal;
				}
				else{
					maxDim = layout.qHyperCube.qDimensionInfo[1].qCardinal;
				}
				if(layout.colorType) {
					// use the Qlik Sense Theme
					if (Theme.palettes.data.length > 0) {
						if (Theme.palettes.data[0].type === 'pyramid' 
							&& Theme.palettes.data[0].scale.length >= maxDim -1) {
							colorScale = Theme.palettes.data[0].scale[maxDim -1];
						} else if (Theme.palettes.data[0].type === 'row' ) {
							colorScale = Theme.palettes.data[0].scale;
						} else if (Theme.palettes.data.length > 1 
							&& Theme.palettes.data[1].type === 'row' ) {
							colorScale = Theme.palettes.data[1].scale;
						}
					} else {
						// set some default scale as fallback (12 colors standard)
						colorScale = ["#332288", "#6699cc", "#44aa99", "#88ccee", "#117733", "#999933", "#ddcc77", "#661100", "#cc6677", "#882255", "#aa4499"];
					}
				}

				var  col = 0;
				if(!(numDim==1 || layout.onlyonedimension)) {
					col = 1;
				}

				fullMatrix.forEach(function (row) {
					col = 0;
					var thisColor = "";
					//////////////// BY DIMENSION ////////////////
					if(layout.colorType) {
						if (row[col].qElemNumber >= 0) {
							thisColor = colorScale[row[col].qElemNumber % colorScale.length];
						} else {
							thisColor = disColor;
						}
					}
					//////////////// BY MEASURE ////////////////
					else {
						if (colEx) { //if a color expression is set, use that color

							thisColor = row[numDim+1].qText; // Counting starts from 0, so numDim is first measure

						} else { // if one isn't set, use the value of the data to determine the proper color
							if (maxVal === minVal) {
								var myVal = 1;
							} else {
								var myVal = (row[1].qNum - minVal) / (maxVal - minVal); // by subtracting the minVal we set the lowest val to zero and the cold color
							}
							var scaledColor = vizScale(myVal).hex(); // scale that color
							thisColor = scaledColor;
						}
					}
					
					arrJ[row[0].qText.toLowerCase()] = { //set the arrJ to the data 
						"val": {
							//"num": row[1].qNum,
							//"numText": row[1].qText,
							"qIndex": row[0].qElemNumber
						},
						"dimensions": function (d) {
							var arr = [];
							
							for(var i=0; i<numDim; i++){
								//console.log(row);
								arr[i] = {
									"text": row[i].qFallbackTitle,
									"num": row[i].qNum,
									"numText": row[i].qText,
									"qIndex": row[0].qElemNumber
								}
							}
							return arr;
						}(),
						"measures": function (d) {
							var arr = [];
							
							for(var i=numDim; i<row.length; i++){
								//console.log(row);
								arr[i-numDim] = {
									"text": row[i].qFallbackTitle,
									"num": row[i].qNum,
									"numText": row[i].qText,
									"qIndex": row[0].qElemNumber
								}
							}
							return arr;
						}(),
						"printName": row[0].qText,
						"color": thisColor,
						"opacity": layout.colorOpacity || 1
					}
				});
				
				function processXml(xml) { //load the SVG
					if (xml) { //if it loaded properly...
						$element.css("position", "relative");
						// console.log(extID)
						$element.append("<div id='" + extID + "'></div>"); //create the container div
						var borders = layout.showBorders; //show borders?
						var con = $("#" + extID);
						con.css({ //set height and width of container
							"position": "relative",
							"height": $element.height() - 10 + "px",
							"width": $element.width() - 10 + "px"
						});
						
						// set a class attribute to the svg
						xml.setAttribute("class", "svg_map");

						con.append(xml); //append the svg

						var $svg = d3.select('#' + extID + ' svg');

						var svgW = $svg.attr("width");
						var svgH = $svg.attr("height");
						
						// -------------------------- Tooltip --------------------------
						// Only one tooltip, if already exists, delete it or not recreate it
						$( ".tooltip" ).remove();
						
						// ------ TOOLTIP : CUSTOMIZATION BACKGROUND COLOR ------
				
						if(layout.popupCustom){
							
							// change tooltip background color
							var str_bg_color = layout.popupBackgroundcolor;
							var isOK = IsOKColor(str_bg_color);
							
							// change tooltip background opacity
							if(layout.popupBackgroundopacity==undefined)
								layout.popupBackgroundopacity = 8;
							
							var backgroundstyle;
							
							if(isOK){
								var str_rgba = "background-color:rgba("+layout.popupBackgroundcolor+","+(layout.popupBackgroundopacity/10)+");"
							}
							else{
								var str_rgba = "background-color:rgba(255, 255, 255, "+(layout.popupBackgroundopacity/10)+");";
								
							}
							
							// change display border
							if(layout.popupDisplayborder || layout.popupDisplayborder==undefined)
								backgroundstyle = "style=\""+str_rgba+" border: solid 1px #aaa;\"";
							else
								backgroundstyle = "style=\""+str_rgba+"\"";
							
							
							$("body").append("<div class=\"tooltip\" "+backgroundstyle+"></div>");
							
						}
						else {
							$("body").append("<div class=\"tooltip\" style=\"background-color:rgba(255, 255, 255, 0.8); border: solid 1px #aaa;\"></div>"); //add the tooltip to the body
						}
						// ------ TOOLTIP : CUSTOMIZATION BACKGROUNG COLOR ------
						
						// -------------------------- Tooltip --------------------------
						
						//$("body").append("<div class=\"tooltip n\"></div>"); //add the tooltip to the body
						// Custom Tooltip Color
						//$(".tooltip").css("background", tooltip.backgroundColor).css("color", tooltip.textColor);
						//$(".tooltip:after").css("color", tooltip.backgroundColor);

						//This is hacky, serialize it into the file instead.
						if (!($svg.attr("viewBox"))) { //set the viewBox of the SVG
							$svg.attr("viewBox", "0 0 " + unitStrip(svgW) + " " + unitStrip(svgH))
						}
						$svg //this setting makes the svg resposive basically
							.attr({
								"preserveAspectRatio": "xMinYMin meet",
								"height": con.height(),
								"width": con.width()
							});
						if (!showText) { //setting of whether to show text in the SVG or not
							$svg.selectAll("text").style("display", "none");
						}
						var $svgElements = $svg.selectAll("rect,polygon,circle,elipse,path,polyline").datum(function () { //attach the data to the svg objects...if the data doesn't match the id, set it to the disabled color
							var elData;
							if (this.id.toLowerCase() in arrJ) {
								elData = arrJ[this.id.toLowerCase()];
							} else {
								elData = {
									"val": {
										"num": null,
										"numText": null
									},
									"color": disColor,
									"opacity": layout.colorOpacity || 1
								}
							}
							return elData;
						})
						.attr("stroke", "none")
						.style("stroke", "none")
						.each(function (d, i) { //for each item...
							var t = this;
							if (borders) { //set borders or not
								$(t)
								.attr({
									"stroke": "#454545",
									"stroke-width": ".5"
								})
								.css("stroke", "#454545");
							}
							$(t).css("opacity", d.opacity);
							colorIt(t, d, arrJ, false); //color the item
							//if (layout.pop && (this.id.toLowerCase() in arrJ)) { //if popups are set, set the popup to show 
							if (layout.popupDisplay && (this.id.toLowerCase() in arrJ)) { //if popups are set, set the popup to show 
								$(this).on({
									mousemove: function (e) {
										//$(".tooltip").css("left", (e.pageX - (tooltip.width/2)) + "px").css("top", (e.pageY - tooltip.height) + "px");
										
										// -------------------------- Tooltip --------------------------
										
										// adapt tooltip position
								
										var map_tooltipX = e.pageX,
											map_tooltipY = e.pageY,
											elem = $(".tooltip");
										
										// shift horizontal -- right
										if(map_tooltipX > ($element[0].offsetWidth + (w/2))){
											map_tooltipX -= elem.width();
										}
										
										// shift vertical -- down
										if((map_tooltipY + elem.height()) > ($element[0].offsetHeight + (h/2))){
											map_tooltipY -= elem.height();
										}
										
										elem.css("left", (map_tooltipX + 10) + "px").css("top", (map_tooltipY) + "px");
										
										// -------------------------- Tooltip --------------------------
									},
									mouseenter: function () {
										
										// -------------------------- Tooltip --------------------------
								
										var res;
										var content = "";
										
										if(layout.popupCustom){
										
											// TITLE
											if(layout.popupDisplaytitle && layout.popupTitle){
											
												// Keywords
												res = ReplaceCustomKeywords(layout.popupTitle, d, layout);
												
												// change tooltip title color
												var str_title_color = layout.popupTitlecolor;
												var isOK = IsOKColor(str_title_color);
												var title_style;
												
												if(isOK){
													title_style = "style=\"color:rgb("+str_title_color+");\"";
												}
												
												content += "<h1 "+title_style+">"+res+"</h1>";
											}
											
											// MEASURES
											if(layout.popupMeasures){
												
												//console.log(d.val);
												
												// change tooltip measure color
												var str_measure_color = layout.popupMeasurescolor;
												var isOK = IsOKColor(str_measure_color);
												var measure_style;
												
												if(isOK){
													measure_style = "style=\"color:rgb("+str_measure_color+");\"";
												}
												
												for(var i=0; i<d.measures.length; i++){
													content+="<p "+measure_style+">";
														if(layout.popupMeasureslabel || layout.popupMeasureslabel==undefined)
																content += layout.qHyperCube.qMeasureInfo[i].qFallbackTitle + ": ";
														//console.log(d.measures);
														content += d.measures[i].numText;
													content+="</p>";
												}
											}
											
											// ADD CONTENT
											if(layout.popupDisplayaddcontent && layout.popupAddcontent){
												
												// Keywords
												res = ReplaceCustomKeywords(layout.popupAddcontent, d, layout);
												
												content+="<p>"+res+"</p>";
											}
										}
										else{
											content += "<p>" + d.printName +"</p>";
											for(var i=0; i<d.measures.length; i++){
												content += "<p>" + layout.qHyperCube.qMeasureInfo[i].qFallbackTitle + ": " + d.measures[i].numText+"</p>";
											}
										}
										
										// -------------------------- Tooltip --------------------------
								
										$(".tooltip")
										.html(content)
										.show();
										
										$(this).css('cursor', 'pointer');
										
										//$(".tooltip").html(d.printName + ": " + formatNumber(d.val.numText));
										//tooltip.width = $(".tooltip").width() + (tooltip.padding * 2);
										//tooltip.height = $(".tooltip").height() + (tooltip.padding * 2) + tooltip.arrowHeight;
										//$(".tooltip").show();
									},
									mouseleave: function () {
										$(".tooltip").hide();
									}
								});
							}
						});

						$svg.selectAll("g").datum(function () { //do the same thing for g elements.  this had to be a separate loop for various reasons although in the future it would be nice to do it in one loop
							var elData;
							if (this.id.toLowerCase() in arrJ) {
								elData = arrJ[this.id.toLowerCase()];
							} else {
								elData = {
									"val": {
										"num": null,
										"numText": null
									},
									"color": disColor
								}
							}
							return elData;
						})
						.attr("stroke", "none")
						.style("stroke", "none")
						.each(function (d, i) {
							if (borders) {
								$(this)
								.attr({
									"stroke": "#454545",
									"stroke-width": ".5"
								})
								.css("stroke", "#454545");
							}
							var t = this;
							colorIt(t, d, arrJ, false);
							//if (layout.pop && (this.id.toLowerCase() in arrJ)) {
							if (layout.popupDisplay && (this.id.toLowerCase() in arrJ)) {
								$(this).on({
									mousemove: function (e) {
										//$(".tooltip").css("left", (e.pageX - (tooltip.width/2)) + "px").css("top", (e.pageY - tooltip.height) + "px");
										
										// -------------------------- Tooltip --------------------------
										
										// adapt tooltip position
								
										var map_tooltipX = e.pageX,
											map_tooltipY = e.pageY,
											elem = $(".tooltip");
										
										// shift horizontal -- right
										if(map_tooltipX > ($element[0].offsetWidth + (w/2))){
											map_tooltipX -= elem.width();
										}
										
										// shift vertical -- down
										if((map_tooltipY+ elem.height()) > ($element[0].offsetHeight + (h/2))){
											map_tooltipY -= elem.height();
										}
										
										elem.css("left", (map_tooltipX) + "px").css("top", (map_tooltipY) + "px");
										
										// -------------------------- Tooltip --------------------------
												
									},
									mouseenter: function () {
										
										// -------------------------- Tooltip --------------------------
										
											var res;
											var content = "";
											
											if(layout.popupCustom){
												
												// TITLE
												if(layout.popupDisplaytitle && layout.popupTitle){
													
													// Keywords
													res = ReplaceCustomKeywords(layout.popupTitle, d, layout);
										
													var str_title_color = layout.popupTitlecolor;
													var isOK = IsOKColor(str_title_color);
													var title_style;
													
													if(isOK){
														title_style = "style=\"color:rgb("+str_title_color+");\"";
													}
													
													content += "<h1 "+title_style+">"+res+"</h1>";
												}
										
												// MEASURES
												if(layout.popupMeasures){
													
													// change tooltip measure color
													var str_measure_color = layout.popupMeasurescolor;
													var isOK = IsOKColor(str_measure_color);
													var measure_style;
													
													if(isOK){
														measure_style = "style=\"color:rgb("+str_measure_color+");\"";
													}

													content += "<p "+measure_style+"><ul>";
													for(var i=0; i<d.measures.length; i++){
														content+="<li>";
															if(layout.popupMeasureslabel || layout.popupMeasureslabel==undefined)
																	content += layout.qHyperCube.qMeasureInfo[i].qFallbackTitle + ": ";
															content += d.measures[i].numText;
														content+="</li>";
													}
													content += "</ul></p>";
													
												}
									
												// ADD CONTENT
												if(layout.popupDisplayaddcontent && layout.popupAddcontent){
													
													// Keywords
													res = ReplaceCustomKeywords(layout.popupAddcontent, d, layout);
													
													content+="<p>"+res+"</p>";
												}
											}
											else{
												content += "<p>" + d.printName +"</p>";
												for(var i=0; i<d.measures.length; i++){
													content += "<p>" + layout.qHyperCube.qMeasureInfo[i].qFallbackTitle + ": " + d.measures[i].numText+"</p>";
												}
											}
										
											$(".tooltip")
											.html(content)
											.show();
										
										// -------------------------- Tooltip --------------------------
										
											$(this).css('cursor', 'pointer');
											//$(".tooltip").html(d.printName + ": " + d.val.numText);
											//tooltip.width = $(".tooltip").width() + (tooltip.padding * 2);
											//tooltip.height = $(".tooltip").height() + (tooltip.padding * 2) + tooltip.arrowHeight;
											//$(".tooltip").show();
									},
									mouseleave: function () {
												$(".tooltip").hide();
									}
								});
							}
						});

						// always remove old text elements
						$svg.selectAll("text.measure-text").remove();
						if (showText && showMeasure) {
							$svgElements.each(function (d, i){
								if (this.id.toLowerCase() in arrJ) {
									var bbox = this.getBBox(),
										mText = d.measures[0].numText,
										mColor = d.color;
									var $text = $svg.select("g").append("text")
									.attr({
										"transform": "translate(" + (bbox.x + bbox.width/2) + " " + (bbox.y + bbox.height/2) + ")",
										"class": "measure-text",
										"stroke": "none",
										"fill": function (d, i) {
											return (measureCustColor ? measureColor.color : (d3.hsl(mColor).brighter(1) == "#ffffff" ? "#A0A0A0" : "#F0F0F0"));
										},
										"font-family": "Qlik Sans, sans serif",
										"font-size": measureFontSize,
										"pointer-events": "none"
									})
									.text(function (d, i) {
										return mText;
									});

									// reposition text in middle vertically and horizontally
									var tb = $text.node().getBBox();
									$text.node().setAttribute("transform", "translate(" + (bbox.x + bbox.width/2 - tb.width/2) + " " + (bbox.y + bbox.height/2 + tb.height/4) + ")");
								}
							});
						}

						$element.find('.selectable').on('qv-activate', function (self) { //when an item is clicked, add it to the selected values and show the Sense UI for selections
							if (this.hasAttribute("data-value")) {
								var elem = $(this);
								//set the class to either selected (if it wasn't already selected) or selectable (if it was already selected)
								if (elem.attr("class").indexOf("selected") > -1) {
									var selClass = elem.attr("class");
									elem.attr("class", selClass.replace("selected", "selectable"));
									$element.find('.selectable').css("opacity", layout.colorOpacity);
								} else {
									elem.attr("class", "selected");
									elem.css("opacity", layout.colorOpacity);
									$element.find('.selectable').css("opacity", .3); // overide opacity property, simulate class qv-selection-active
								}
								//get the data-value and select it
								var value = parseInt(this.getAttribute("data-value"), 10),
									dim = 0;

								me.selectValues(dim, [value], true);
							}
						});
						
						
					// ------------------- ZOOM & DRAG & ROTATION ------------------- 
					// http://bl.ocks.org/mbostock/6123708#index.html
					
					
					var margin = {top: -5, right: -5, bottom: -5, left: -5};
					
					if(layout.zoommin==undefined) layout.zoommin = 0.5;
					if(layout.zoommax==undefined) layout.zoommax = 10;
					
					var zoom = d3.behavior.zoom() // This is simply the definition of the zooming behavior, not the application of it
						.scaleExtent([layout.zoommin, layout.zoommax])
						.on("zoom", function(d){ // By definition, d3.event.translate and .scale are known in the callback
							container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
						});
					
					var drag = d3.behavior.drag()
						.origin(function(d) { return d; })
						.on("dragstart", function (d) {
							d3.event.sourceEvent.stopPropagation();
							d3.select(this).classed("dragging", true);
						})
						.on("drag", function (d) {
							d3.select(this)
							.attr({
								"cx": d.x = d3.event.x,
								"cy": d.y = d3.event.y}
							);
						})
						.on("dragend", function (d) {
							d3.select(this).classed("dragging", false);
						});
					
					// global svg
					var svg = d3.select("div#"+extID).append("svg")
						.attr({
							"id": "svg_parent",
							"width": w + margin.left + margin.right,
							"height": h + margin.top + margin.bottom
						})
						// first group
						.append("g")
							.attr("id", "g_rotate")
						// second group --> var svg
						.append("g")
						.attr({
							"id": "g_zoom",
							"transform": "translate(" + margin.left + "," + margin.right + ")"
						})
						.call(zoom);
		
					// in first group, add the ROTATION BUTTONS
					if (!layout.hideRotation) {
						var rotate = d3.select("g#g_rotate");
						
						rotate.append("svg:image")
							.attr({
								"id": "btn_rotate_left",
								"xlink:href": "/Extensions/svgReader/imgs/svgReader_arrow_left.png",
								"height": 50,
								"width": 50
							})
							.style("opacity", "0.5")
							.on("mouseenter", function(d){
								d3.select(this).style("opacity", "1");
							})
							.on("mouseleave", function(d){
								d3.select(this).style("opacity", "0.5");
							})
							.on("click", function(d){
								var rot = 0;
								if(d3.select("g#g_zoom")[0][0].transform.baseVal.getItem(0))
									rot = d3.select("g#g_zoom")[0][0].transform.baseVal.getItem(0).angle;
								
								var cx = d3.select("g#g_zoom")[0];
								d3.select("g#g_zoom")
								.attr("transform", "rotate("+(rot-10)+", "+w/2+", "+h/2+")");
							});
						
						rotate.append("svg:image")
							.attr({
								"id": "btn_rotate_right",
								"xlink:href": "/Extensions/svgReader/imgs/svgReader_arrow_right.png",
								"height": 50,
								"width": 50,
								"x": w-60
							})
							.style("opacity", "0.5")
							.on("mouseenter", function(d){
								d3.select(this).style("opacity", "1");
							})
							.on("mouseleave", function(d){
								d3.select(this).style("opacity", "0.5");
							})
							.on("click", function(d){
								//var rot = d3.select("g#g_zoom")[0][0].transform.baseVal[0].angle;
								var rot = 0;
								if(d3.select("g#g_zoom")[0][0].transform.baseVal.getItem(0))
									rot = d3.select("g#g_zoom")[0][0].transform.baseVal.getItem(0).angle;
								
								d3.select("g#g_zoom")
								.attr("transform", "rotate("+(rot+10)+", "+w/2+", "+h/2+")");
							});

						}

						// in second group, add a rect who catch all events --> var rect
						var rect = svg.append("rect")
							.attr({
								"width": w,
								"height": h
							})
							.style({
								"fill": "none",
								"pointer-events": "all"
							});

						// third group --> var container
						var container = svg.append("g").attr("id", "g_container");
						
						// ------ CONTENT ------

						$("#" + extID + ".svg_map").appendTo(container);
							
						// ------ CONTENT ------
						
						// ------------------- ZOOM & DRAG & ROTATION ------------------- 
						
							
					} else { //the xml didn't load
						$element.html("<strong>Could not find SVG</strong>");
					}
				}

				setSVG(qlik, self, layout).then(function (loadThis) {
					
					var loadThis = layout.svg, // custom SVG, if it exists
						currentPath = (baseUrl.slice(-1) === "/" ? "" : "/") + "extensions/svgReader/";
					
					if (layout.svg == "custom") {
						if(layout.loadSVGAbsolute){
							loadThis = customSVG; 
						}
						else{
							loadThis = baseUrl + currentPath + customSVG;
						} 
					}
					else{
						loadThis = currentPath + loadThis;
					}

					if (loadThis == "NO VARIABLE") {
						$element.html("<strong>No Variable Found With That Name</strong>");
					} else {
						// store processed xml in scope so we do not need to load and parse svg file in every paint call
						if (!scope.hasOwnProperty("svgFile") || scope.svgFile !== loadThis){
							scope.svgFile = loadThis;
							scope.svgXml = {};
							d3.xml(loadThis, "image/svg+xml", function(xml) {
								if (xml) {
									scope.svgXml = xml.documentElement;
									processXml(scope.svgXml)
								}
							});
						} else {
							processXml(scope.svgXml);
						}
					}
					resolvePrint();
				});
			});
			return new qlik.Promise(function(resolve) { 
				resolvePrint = resolve; 
			});

			// function formatNumber(d) {
			// 	return d.toString().replace(/(\d+)(\d{3})(\d{3})/, '$1'+','+'$2'+','+'$3'); ;
			// };
		}
	};
});
