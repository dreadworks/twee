(function ($) {
	'use strict';

	$(function () {
		try {


			// build a norne instance
			norne({ 
				depth: 100,
				fps: 25,
				canvas: $('#norne')[0]

			}, function (world) {

				var character;


				character = world.character({
					sprite: 'sprites.png',
					width: 1,
					height: 1
				});
				
				character.addAnimation('standing.right', {
					frame: { width: 83, height: 143.5 },
					start: { x: 10, y: 628 },
					columns: 12,
					framecount: 22,
					tick: 75
				});
				


				
				/*
				_(5).times(function (dist) {
					var lane;

					dist *= 20;
					lane = world.createLane(dist);
					lane.color('BFA57A');

					_(10).times(function (i) {
						lane.addPoint(i*2000, Math.floor(Math.random() * 300));
					});
				});
				*/
				
				
				

				var lane;
				lane = world.createLane(0);
				lane.color('efefef');
				lane.addPoint(-20,100);
				lane.addPoint(300,300);
				lane.addPoint(600,60);

				// put character on dist 0
				world.put(0);
				world.pos(100);


				console.log('init done', world);
				window.world = world;


			});


		} catch(exc) {
			console.error(exc.name, exc.message);
		}
	});

}(jQuery));