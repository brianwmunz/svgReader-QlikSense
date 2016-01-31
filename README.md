The Qlik Sense svgReader Extension is meant to provide the ability to visualize data on an image or map using color and shading, similar to a choropleth map.  The extension itself is pre-packaged with 34+ maps of various countries and their different regions, as well as a world map and maps of Europe and Africa. 

Also, there is the ability to load a custom SVG (such as a floorplan) and visualize data across its regions. 


![alt tag](https://raw.githubusercontent.com/brianwmunz/svgReader-QlikSense/master/screenshots/screenCap.gif)



*********************************
How It Works
*********************************



An SVG image is basically an XML document which contains data telling the internet browser how to draw an image. The different shapes that the SVG draws can be separated out in the XML and thus manipulated and colored however necessary. This extension takes advantage of this technology by allowing the QVW to target and color the different shapes by identifying the ID of the SVG element. 



![alt tag](https://raw.githubusercontent.com/brianwmunz/svgReader-QlikSense/master/screenshots/selections.gif)



For example, a map of US states will have a shape for the state of Pennsylvania. This state is represented in the SVG image as some code with an ID of "PA". By targeting this ID of "PA" the extension is able to then color this state.A very useful (and free) tool for identifying and manipulating SVG IDs is Inkscape.  It can also be used to draw SVGs.



[http://www.inkscape.org/en/](http://www.inkscape.org/en/)



Once a map is chosen and loaded in the extension, the data in the QVF will need to somehow link to the region ID on the SVG. Typically the regions are identified by ISO code. The reason for this is because it is a globally standard code for identifying regions, and it eliminates the possibility for confusion over the naming, spelling, etc. of the different regions. Loading these ISO codes should be fairly easy, and the data can be scraped from sites like Wikipedia without much difficulty.



You can also create custom SVGs of just about anything, even a snail:



![alt tag](https://raw.githubusercontent.com/brianwmunz/svgReader-QlikSense/master/screenshots/snail.png)


Or floorplan of an egyptian burial tomb:



![alt tag](https://raw.githubusercontent.com/brianwmunz/svgReader-QlikSense/master/screenshots/mastaba.png)


You can now also set the custom SVG path using a Qlik Sense variable, which could allow for drilldowns, etc.



If you create your own custom SVG maps, please contribute them to [Qlik Branch](http://branch.qlik.com)


You may custom your tooltip/popup with many options.



*********************************
Installation & Use
*********************************


**Dimensions**
The extension only needs one dimension.  This dimension should match the ID of the svg elements.  So if you're using the map of the 50 US states, this dimension should have the two character state abbreviation.
You can add until two dimensions.


**Measures**
The first measure is the value associated with the dimension.  If there isn't a color dimension, this value will be used to shade the regions between two colors.
You can add until two measures.
The second measure can be used as color associated with the dimension (ckeckbox in color settings).


**Properties**
The properties are relatively straightforward.  Please note that the color picker property is not supported and is an undocumented property in Qlik Sense. 


Now an explanation of the properties:

![alt tag](https://raw.githubusercontent.com/brianwmunz/svgReader-QlikSense/master/screenshots/propsnormal.png)

------- SVG Settings -------

**SVG Map** is the list of built in SVG maps.  If you want to load a custom SVG, select the custom SVG option.

**Show element borders** tells the extension whether or not to put borders around the SVG elements.  Sometimes forcing borders around the elemts makes the extension more readable.

**Show SVG Text** is an option whether to show text on the custom SVG or not. 

![alt tag](https://raw.githubusercontent.com/brianwmunz/svgReader-QlikSense/master/screenshots/customPath.PNG)

**Absolute path** check it when you use external path. Warrning if you play with cross domain.

**Custom SVG Name** tells the extension where to find the custom SVG you want to load.  This can also be set to an expression as long as it returns a valid SVG path.

![alt tag](https://raw.githubusercontent.com/brianwmunz/svgReader-QlikSense/master/screenshots/propsCustom.png)

**Treat Custom SVG as Variable** tells the extension to look for a Qlik Sense variable specified in the Custom SVG text box. 

------- Color Settings -------

**Color Type** set the color calculation "by dimension" or "by measure"

- Color Type = "by dimension"

	**Only first dimension** if true, calculate the color by the first dimension. if false, calculate the color with the second dimension. --> use persistent color

- Color Type = "by measure"

	**Color Calculation** if true, calculate the color by first measure. if false, calculate the color by the second measure (= color expression).
	
	- Color Calculation = false

		**Disabled Color** sets the color of regions that are in the SVG but have no data associated to it.

		**Hot Color** sets the color to use for the upper values.

		**Base (Cold) Color** sets the base color to use for the lower values.  This can be used to blend colors.  Or if you simply want to shade one color, set this to white.

		**Custom Hex Color for Hot**
		
		**Custom Hex Color for Cold**

------- Pop-up Settings -------

**Show Pop-up** controls whether or not to show a pop-up on mouse over.  The pop-up will simply contain the dimension field and value.

**Custom Pop-up** show/hide more options to custom your pop-up. If you don't check the box, the simple pop-up is visible.

[in the custom pop-up you can use some keywords :
	#dimension_label_1# 	if you want to write the label of the first dimension
	#dimension_value_1# 	if you want to write the value of the first dimension
	#dimension_label_2# 	if you want to write the label of the second dimension
	#dimension_value_2# 	if you want to write the value of the second dimension
	#measure_label_1# 	if you want to write the label of the first measure
	#measure_value_1#	if you want to write the value of the first measure
	#measure_label_1# 	if you want to write the label of the second measure
	#measure_value_2# 	if you want to write the value of the second measure
]

**Show Title** show/hide title in your custom pop-up.

**Title** you can define a custom title. 

**Title Color** you can change the color of the title. For the moment only rgb, so 3 numbers with comma separator. Between 0,0,0 (black) and 255,255,255 (white)

**Show Measure** show/hide a measures list in your custom pop-up.

**Show Measure Label** show/hide the measures labels in your custom pop-up.

**Measure Color** you can change the color of the measures list. For the moment only rgb, so 3 numbers with comma separator. Between 0,0,0 (black) and 255,255,255 (white).

**Show Additional Content** show/hide an additional content. Support html.

**Background Color** you can change the color of the pop-up background. For the moment only rgb, so 3 numbers with comma separator. Between 0,0,0 (black) and 255,255,255 (white).

**Background Opacity** you can change the opacity of the pop-up background.

**Show Border** show/hide the pop-up border.


*********************************
Needed Improvements
*********************************


This extension was in high demand so there are several things which could have been done to improve it.  For example...


- Reduce the number of loops the extension does across the SVG to improve performance.


- Add the ability for the extension to zoom into the selected regions


- Add a lasso tool


- Make an option to not use the Qlik Sense UX selection model.  One click = one selection


-  Make a more robust color picker


- Have the extension repaint the SVG rather than emptying the extension and redrawing the whole thing

- Add an option to generate a legend

- Do the color expression without needing another expression to be added first

