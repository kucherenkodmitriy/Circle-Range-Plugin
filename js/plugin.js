(function(w){

	var settings = {
		selector: "input[type='range'].roundRange",
		allRangeElements: [],
		hideElementStyle: [
			{ 
				key: 'position',
			  	value: 'absolute' 
			},
			{ 
				key: 'left',
			  	value: '-99999999px' 
			},
			{ 
				key: 'visibility',
			  	value: 'hidden' 
			}
		]
	};

	w.addEventListener('load', init);

	function init(){

		var componentCreator = new ComponentCreator();

		settings.allRangeElements = document.querySelectorAll(settings.selector);

		var dataBindCounter = 0;
		Array.prototype.forEach.call(settings.allRangeElements, function(rangeElement){
			
			rangeElement.setAttribute("data-svgBind", ++dataBindCounter);
			//replaceRangeElement.call(_private,rangeElement);

			settings.hideElementStyle.forEach(function(style){
				rangeElement.style[style.key] = style.value;
			});

			var rangeComponent = componentCreator.create({
				id: dataBindCounter
			});

			rangeElement.parentNode.insertBefore(rangeComponent.svg,rangeElement);
			
		});

	}


	var Components = {

		defaultRange: function( options ){

			var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
			this.svg = svg;

			var rangeElementId = options.id || 0;

			var config = {
				standard: {
					graphics: {
						handleSVG:{
							width: 40,
							height: 40
						},
						handleCircle: {
							cx: 0,
							cy: 0,
							r: 19,
							stroke: "rgb(169,169,169)",
							fill: "white"
						},
						handlePointer: {
							x1: 0,
							y1: 10,
							x2: 0,
							y2: 20,
							stroke: "rgb(169,169,169)",
							'stroke-width': 1
						},
						handleText: {
							'text-anchor': 'middle',
							x: 0,
							y: 4,
							fill: 'rgb(169,169,169)'
						}
					}
				}
			};

			config.standard.drag = {
				dragHandler: function(d){
					var x,y,

						svgParams = config.standard.graphics.handleSVG;

					if(d3.event.type == "dragstart"){
						x = -(svgParams.width/2 - d3.event.sourceEvent.offsetX);
						y = -(svgParams.height/2 - d3.event.sourceEvent.offsetY);
					}else{
						x = d3.event.x;
						y = d3.event.y;
					}

					var hypotenuse = Math.sqrt( ( Math.pow(x,2) * 10 + Math.pow(y,2) * 10 ) / 10 );
					var cosAlpha = x / hypotenuse;
					var angle = Math.acos(cosAlpha) * 180 / Math.PI;

					if(y > 0){
						if(angle - 90 < 0){
							angle = 360 + (angle - 90);
						}else{
							angle = angle - 90;
						}

					}else{
						angle = 270 - angle;
					}

					d3.select(this).attr("transform", "rotate(" + ( angle ) + ")");
					d3.select(this).attr("data-angle", angle);

					var rangeElement = document.querySelector("input[data-svgBind='" + rangeElementId + "']");
					var minVal = rangeElement.getAttribute("min") || 0;
					var maxVal = rangeElement.getAttribute("max") || 100;
					roundedValue = Math.round(angle * maxVal / 360);
					rangeElement.value = roundedValue;

					d3.select(svg).select("text").text(roundedValue);
				},
				dragEndHandler: function(d){



				}
			};
			config.standard.drag.obj = d3.behavior.drag()
											.on("drag", config.standard.drag.dragHandler)
											.on("dragstart", config.standard.drag.dragHandler)
											.on("dragend", config.standard.drag.dragEndHandler);

			var grConfig = config.standard.graphics;

			d3.select(svg)
				.attr(grConfig.handleSVG);

			var transformGroup = d3.select(svg)
				.append("g")
				.attr("transform", "translate(20,20)");

			var circleWithPointer = transformGroup
				.append("g")
				.attr("transform", "rotate(0)")
				.call(config.standard.drag.obj);
				//.on('mousedown', config.standard.drag.handler);

			var circle = circleWithPointer
				.append("circle")
				.attr(grConfig.handleCircle);
			var line = circleWithPointer
				.append("line")
				.attr(grConfig.handlePointer);

			transformGroup
				.append("text")
				.attr(grConfig.handleText)
				.text(0);

		}
	};

	function ComponentCreator(){}

	//ComponentCreator.prototype.component = Components.defaultRange; //default component

	ComponentCreator.prototype.create = function ( options ){

		switch( options && options.type ){

			default:
				this.component = Components.defaultRange;
				break;
		}

		return new this.component( options );
	};

	/*
	
	var rangeCreator = new ComponentCreator();

	var component = rangeCreator.create();

	*/

	//HTMLInputElement.prototype.roundRange

})(window);