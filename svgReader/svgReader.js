/*globals define*/
var self;
define(["qlik","jquery", "./d3", "./chroma", "core.utils/theme", "./svgOptions", "./svgFunctions", "./senseUtils"], function (qlik, $, d3, chroma, Theme) {
	//Theme is an unsupported hook into the color picker color themes
	'use strict';

	//get baseUrl of extension assets so css and svg can be loaded correctly in both client and mashup
	var baseUrl = typeof configs !== "undefined" ? (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix : "";

	//load css here so that mashups without require.js text extension loaded still work
	$.get(baseUrl + "/Extensions/svgReader/style.css", function(cssContent) {
	   $( "<style>" ).html( cssContent ).appendTo( "head" );
	});

	return {
		initialProperties: {
			version: 1.0,
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 3,
					qHeight: 3000
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
					max: 1
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
								displayPop: {
									type: "boolean",
									label: "Display Pop-up",
									ref: "pop",
									defaultValue: true
								},
								textOption: {
									type: "boolean",
									label: "Show SVG Text",
									ref: "showText",
									defaultValue: false
								},
/*SVGZoom: {
									type: "boolean",
									label: "Zoom Selected Regions",
									ref: "zoom",
									defaultValue: false
								},*/
								DisColor: {
									type: "string",
									expression: "optional",
									component: "color-picker",
									label: "Disabled Color",
									ref: "disColor",
									show: function (data) {
										if (data.qHyperCubeDef.qMeasures.length > 1) { //if a color measure is added don't display this property
											return false;
										} else {
											return true;
										}
									},
									defaultValue: 0
								},
								HotColor: {
									type: "string",
									expression: "optional",
									component: "color-picker",
									label: "Hot Color (if no measure)",
									ref: "hotColor",
									show: function (data) {
										if (data.qHyperCubeDef.qMeasures.length > 1) { //if a color measure is added don't display this property
											return false;
										} else {
											return true;
										}
									},
									defaultValue: 9
								},
								ColdColor: {
									type: "string",
									expression: "optional",
									component: "color-picker",
									label: "Base (Cold) Color",
									ref: "coldColor",
									show: function (data) {
										if (data.qHyperCubeDef.qMeasures.length > 1) { //if a color measure is added don't display this property
											return false;
										} else {
											return true;
										}
									},
									defaultValue: 10
								},
								HotColorCustom: {
									type: "string",
									label: 'Custom Hex Color for Hot',
									ref: 'hotColorCustom',
									defaultValue: ''
							    },
								ColdColorCustom: {
									type: "string",
									label: 'Custom Hex Color for Cold',
									ref: 'coldColorCustom',
									defaultValue: ''
							    }
							}
						},
						// Extra Tooltip Settings
						header: {
							label: "Tooltip Settings",
							type: "items",
							items: {
								TtBgColor: { // Background Color
									type: "string",
									expression: "optional",
									component: "color-picker",
									label: "Background Color",
									ref: "ttBgColor",
									show: function (data) {
										if (data.qHyperCubeDef.qMeasures.length > 1) { 
											return false;
										} else {
											return true;
										}
									},
									defaultValue: 11
								},
								TtFtColor: { // Text Color
									type: "string",
									expression: "optional",
									component: "color-picker",
									label: "Text Color",
									ref: "ttFtColor",
									show: function (data) {
										if (data.qHyperCubeDef.qMeasures.length > 1) { 
											return false;
										} else {
											return true;
										}
									},
									defaultValue: 10
								}
							}
						}
					}
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ($element, layout, self) {
			var html = "",
				self = this,
				lastrow = 0,
				h = $element.height(),
				w = $element.width();
			var extID = layout.qInfo.qId;
			senseUtils.pageExtensionData(self, $element, layout, function ($element, layout, fullMatrix, me) { //function that pages the full data set and returns a big hypercube with all of the data
				//load the properties into variables
				var disColor = Theme.palette[layout.disColor];
				var hotColor = (typeof layout.hotColorCustom !== 'undefined' && layout.hotColorCustom !=='') ? layout.hotColorCustom : Theme.palette[layout.hotColor];
				var coldColor = (typeof layout.coldColorCustom !== 'undefined' && layout.coldColorCustom !=='') ? layout.coldColorCustom : Theme.palette[layout.coldColor];
				var customSVG = layout.loadSVG;
				var showText = layout.showText;
				var tooltip = {
					backgroundColor: Theme.palette[layout.ttBgColor],
					textColor: Theme.palette[layout.ttFtColor],
					width: 0,
					height: 0,
					padding: 8,
					arrowHeight: 8
				}
				//empty out the extension in order to redraw.  in the future it would be good to not have to redraw the svg but simply re-color it
				$element.empty();
				//arrJ is an object that holds all of the relevant data coming from sense that we can match against the SVG
				var arrJ = {};
				//colEx determines if a color measure is added
				var colEx = false;
				if (layout.qHyperCube.qMeasureInfo.length > 1) {
					colEx = true;
				}
				var maxVal = layout.qHyperCube.qMeasureInfo[0].qMax;
				var minVal = layout.qHyperCube.qMeasureInfo[0].qMin;
				//set up the color scale
				var vizScale = chroma.scale([coldColor, hotColor]);
				//iterate through the data and put it into arrJ. this JSON is the same format as the data attached to the SVG elements
				$.each(fullMatrix, function () {
					var row = this;
					var thisColor = "";
					if (colEx) { //if a color expression is set, use that color
						thisColor = row[2].qText;
					} else { // if one isn't set, use the value of the data to determine the proper color
						if (maxVal === minVal) {
							var myVal = 1;
						} else {
							var myVal = (row[1].qNum - minVal) / (maxVal - minVal); // by subtracting the minVal we set the lowest val to zero and the cold color
						}
						var scaledColor = vizScale(myVal).hex(); // scale that color
						thisColor = scaledColor;
					}
					arrJ[row[0].qText.toLowerCase()] = { //set the arrJ to the data 
						"val": {
							"num": row[1].qNum,
							"numText": row[1].qText,
							"qIndex": row[0].qElemNumber
						},
						"printName": row[0].qText,
						"color": thisColor
					}
				});
				setSVG(qlik, self, layout).then(function (loadThis) {
					if (loadThis == "NO VARIABLE") {
						$element.html("<strong>No Variable Found With That Name</strong>");
					} else {
						d3.xml(baseUrl + "/Extensions/svgReader/" + loadThis, "image/svg+xml", function (xml) { //load the SVG
							if (xml) { //if it loaded properly...
								$element.css("position", "relative");
								$element.append("<div id='" + layout.qInfo.qId + "'></div>"); //create the container div
								var borders = layout.showBorders; //show borders?
								var con = $("#" + extID);
								con.css({ //set height and width of container
									"position": "relative",
									"height": $element.height() - 10 + "px",
									"width": $element.width() - 10 + "px"
								});
								con.append(xml.documentElement); //append the svg
								var svgW = d3.select('#' + extID + ' svg').attr("width");
								var svgH = d3.select('#' + extID + ' svg').attr("height");
								$("body").append("<div class=\"tooltip n\"></div>"); //add the tooltip to the body
								// Custom Tooltip Color
								$(".tooltip").css("background", tooltip.backgroundColor).css("color", tooltip.textColor);
								$(".tooltip:after").css("color", tooltip.backgroundColor);
								var $svg = d3.select('#' + extID + ' svg'); //select the svg 
								//This is hacky, serialize it into the file instead.
								if (!($svg.attr("viewBox"))) { //set the viewBox of the SVG
									$svg.attr("viewBox", "0 0 " + unitStrip(svgW) + " " + unitStrip(svgH))
								}
								$svg.attr("preserveAspectRatio", "xMinYMin meet").attr("height", con.height()).attr("width", con.width()); //this setting makes the svg resposive basically
								if (!showText) { //setting of whether to show text in the SVG or not
									$svg.selectAll("text").style("display", "none");
								}
								$svg.selectAll("rect,polygon,circle,elipse,path,polyline").datum(function () { //attach the data to the svg objects...if the data doesn't match the id, set it to the disabled color
									var elData;
									if (this.id.toLowerCase() in arrJ) {
										var thisVal = arrJ[this.id.toLowerCase()].val.num;
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
								}).attr("stroke", "none").style("stroke", "none").each(function (d, i) { //for each item...
									if (borders) { //set borders or not
										$(this).attr("stroke", "#454545").attr("stroke-width", ".5").css("stroke", "#454545");
									}
									var t = this;
									colorIt(t, d, arrJ, false); //color the item
									if (layout.pop && (this.id.toLowerCase() in arrJ)) { //if popups are set, set the popup to show 
										$(this).on({
											mousemove: function (e) {
												$(".tooltip").css("left", (e.pageX - (tooltip.width/2)) + "px").css("top", (e.pageY - tooltip.height) + "px");
											},
											mouseenter: function () {
												$(this).css('cursor', 'pointer');
												$(".tooltip").html(d.printName + ": " + formatNumber(d.val.numText));
												tooltip.width = $(".tooltip").width() + (tooltip.padding * 2);
												tooltip.height = $(".tooltip").height() + (tooltip.padding * 2) + tooltip.arrowHeight;
												$(".tooltip").show();
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
										var thisVal = arrJ[this.id.toLowerCase()].val.num;
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
								}).attr("stroke", "none").style("stroke", "none").each(function (d, i) {
									if (borders) {
										$(this).attr("stroke", "#454545").attr("stroke-width", ".5").css("stroke", "#454545");
									}
									var t = this;
									colorIt(t, d, arrJ, false);
									if (layout.pop && (this.id.toLowerCase() in arrJ)) {
										$(this).on({
											mousemove: function (e) {
												$(".tooltip").css("left", (e.pageX - (tooltip.width/2)) + "px").css("top", (e.pageY - tooltip.height) + "px");
											},
											mouseenter: function () {
												$(this).css('cursor', 'pointer');
												$(".tooltip").html(d.printName + ": " + d.val.numText);
												tooltip.width = $(".tooltip").width() + (tooltip.padding * 2);
												tooltip.height = $(".tooltip").height() + (tooltip.padding * 2) + tooltip.arrowHeight;
												$(".tooltip").show();
											},
											mouseleave: function () {
												$(".tooltip").hide();
											}
										});
									}
								});
								$element.find('.selectable').on('qv-activate', function (self) { //when an item is clicked, add it to the selected values and show the Sense UI for selections
									if (this.hasAttribute("data-value")) {
										//set the class to either selected (if it wasn't already selected) or selectable (if it was already selected)
										if ($(this).attr("class").indexOf("selected") > -1) {
											var selClass = $(this).attr("class");
											$(this).attr("class", selClass.replace("selected", "selectable"));
										} else {
											$(this).attr("class", "selected");
										}
										//get the data-value and select it
										var value = parseInt(this.getAttribute("data-value"), 10),
											dim = 0;
										me.selectValues(dim, [value], true);
									}
								});
							} else { //the xml didn't load
								$element.html("<strong>Could not find SVG</strong>");
							}
						});
					}
				});
			});
			function formatNumber(d) {
				return d.toString().replace(/(\d+)(\d{3})(\d{3})/, '$1'+','+'$2'+','+'$3'); ;
			};
		}
	};
});