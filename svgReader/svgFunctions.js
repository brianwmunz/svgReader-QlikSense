function unitStrip(e) { //strip the weird svg unit format and convert it to pixels
    if (e.indexOf("mm") > -1) {
        e = e.substr(0, e.indexOf("mm"));
        e = e * 3.779527559
    } else if (e.indexOf("pt") > -1) {
        e = e.replace(/([0-9]+)pt/g, function (e, t) {
            return Math.round(parseInt(t, 10) * 96 / 72)
        })
    } else if (e.indexOf("px") > -1) {
        e = e.substr(0, e.indexOf("px"))
    }
    return e
}
var fillSelected = function (t, d, f) { //t = this, d = data object, f determines whether it's a child or not
    if (f != "c") { //if the element is not a child, it's the element that should be selectable
        $(t).attr("class", "selectable");
        $(t).attr("data-value", d.val.qIndex);
    }
    $(t).attr("fill", d.color);
    $(t).attr("style", "");
    $(t).css("opacity", "");
}
function setSVG(qlik, self, layout) {
    return {
        then: function (svgVal) {
            var loadThis = layout.svg; // custom SVG, if it exists
            if (layout.svg == "custom") {
                if (layout.customVar) { //if this customSVG is actually a variable name, get that variable
                    qlik.currApp(self).variable.getContent(layout.loadSVG, function (reply) {
                        svgVal(reply.qContent.qString); //send back the contents of the variable
                    }).
                    catch (function (err) { //that's not a valid variable name, homie
                        svgVal("NO VARIABLE");
                    });
                } else { //they picked an SVG from the list
                    loadThis = layout.loadSVG; 
                    svgVal(loadThis);
                }
			}else{
			  svgVal(layout.svg);
			}
        }
    }
}
var colorIt = function (me, d, arrJ, par) {
    var lid = me.id.toLowerCase();
	
    if (((lid in arrJ) || (par)) && (me.tagName == "g")) { //if this element hooks to the data (ot its parent does) and it's a g (group)type svg element 
        $.each(me.childNodes, function () { //for each of the g's children, either color it or loop again (if the child is a g)
            
			if (this.tagName == "g") {
                colorIt(this, d, arrJ, true)
            } else {
                fillSelected(this, d, "c");
            }
        });
        if (lid in arrJ) { //if it's a g element and the id matches to the data add the selectable class and data-value
            $(me).attr("class", "selectable");
            $(me).attr("data-value", d.val.qIndex);
        }
        $(me).attr("style", "");
        $(me).css("opacity", "");
    } else if ((lid in arrJ) || (par)) { //not a g, it's its own thing...
        fillSelected(me, d, "o");
    } else if (($(me).css("fill") != "none") && !(me.parentNode.id in arrJ) && (par != true)) { //this svg element means nothing to us, data-wise
        $(me).css("fill", d.color);
        $(me).attr("fill", d.color);
    }
}

// ------ GLOBAL FUNCTIONS ------

function myIsNaN(o) {
    return typeof(o) === 'number' && isNaN(o);
}

// Check Color
function IsOKColor(str){
	
	if(str==undefined) return false;
	
	var isOK = false;
	var res = str.split(',');
	
	if(res.length==3){
		
		var nan1 = myIsNaN(parseInt(res[0]));
		var nan2 = myIsNaN(parseInt(res[0]));
		var nan3 = myIsNaN(parseInt(res[0]));
		
		if( !nan1 && !nan2 && !nan3 ) {
			isOK = true;
		}
	}
	return true;
}

// Replace All
function ReplaceAll(str, search, replacement){
	return str.split(search).join(replacement);
}

// Replace All Keywords
function ReplaceCustomKeywords(str, d, layout){
	var res = str;
	//res = ReplaceAll(str, "#dimension_value#", d.printName);
	//res = ReplaceAll(res, "#dimension_label#", layout.qHyperCube.qDimensionInfo[0].qFallbackTitle);
	
	var strval;
	var strlab;
	
	for(var i=0; i<d.dimensions.length; i++){
		strval = "#dimension_value_"+(i+1)+"#";
		strlab = "#dimension_label_"+(i+1)+"#";
		
		res = ReplaceAll(res, strval, d.dimensions[i].numText);
		res = ReplaceAll(res, strlab, layout.qHyperCube.qDimensionInfo[i].qFallbackTitle);
	}
	
	for(var i=0; i<d.measures.length; i++){
		strval = "#measure_value_"+(i+1)+"#";
		strlab = "#measure_label_"+(i+1)+"#";
		
		res = ReplaceAll(res, strval, d.measures[i].numText);
		res = ReplaceAll(res, strlab, layout.qHyperCube.qMeasureInfo[i].qFallbackTitle);
	}

	return res;
}


// ------ GLOBAL FUNCTIONS ------