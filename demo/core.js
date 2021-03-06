(function ($) {
	'use strict';


    /** 
     *  Renders the lanes ground
     *  roundly by interpolating
     *  splines from the ground points.
     */
    norne.obj.define('render.lane.ground.bezier-debug')
        .as({	


            drawPoints: function (points) {
                var i, p;

                for (i=0; i<points.length; i++) {
                    p = points[i];

                    this.ctx.beginPath();

                    this.ctx.arc(p.x, p.y, 5, 0, Math.PI*2, false);
                    this.ctx.closePath();

                    this.ctx.fillStyle = '000000';
                    this.ctx.fill();
                }
            },


            /**
             *  @see render.lane.draw
             */
            draw: function (points) {
                var i = 1, xc, yc;

                if (!points) {
                    return;
                }
                
                this.ctx.beginPath();
                this.ctx.moveTo(points[0].x, points[0].y);

                for (i = 0; i < points.length - 1; i++) {

                    var xmid = (points[i+1].x + points[i].x) / 2;

                    this.ctx.bezierCurveTo(
                        xmid,
                        points[i].y,

                        xmid,
                        points[i+1].y,

                        points[i+1].x,
                        points[i+1].y
                    );
                }

                this.ctx.lineTo(points[i].x, this.canvas.height+10);
                this.ctx.lineTo(points[0].x, this.canvas.height+10);
                this.ctx.closePath();

                this.fill(points, 'rgba(0,0,0,0.5)');

                this.drawPoints(points);
            }

        });


	window.addEventListener('keydown', function (evt) {
		if (evt.keyCode === 39) {
			world.pos(world.pos() + 5);
		}

		if (evt.keyCode === 37) {
			world.pos(world.pos() - 5);
		}
	});


	$(function () {
		try {
			var canvas, overlay;

			canvas = $('#norne');
			overlay = $('#overlay');


			// build a norne instance
			norne({ 
				depth: 100,
				fps: 60,
				angle: 0,
				canvas: canvas[0]
			}, function (world) {
				var imp;

				imp = world.import('map.js');

				imp.on('fileLoaded', function (evtname) {
					console.log('loaded!');
				});

				imp.on('importDone', function () {
					console.log('import done');
					world.broker.render();
					//world.pos(3500);
				});

				imp.start();
				window.world = world;
			});


		} catch(exc) {
			console.error(exc.name, exc.message, exc.stack);
			throw exc;
		}
	});

}(jQuery));