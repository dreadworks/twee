

    
    (function () {

        var exc;
        exc = _(norne.exc.raise).partial('norne');


        /**
         *  ENVIRONMENT
         *  ===========
         */
        define('core.world.env').as({

            /**
             *  Getter and setter for the depthfactor
             *  used to map points.
             *
             *  @param depth The worlds depth
             *  @type depth Number
             */
            depthfactor: function (depth) {

                if (!depth) {
                    return this._depthfactor || 0;
                }

                this._depthfactor = (depth < 10 || 100 < depth) ? 
                    0 : 100/depth;

                return this._depthfactor;
            },


            /**
             *  This gets or sets the worlds depth.
             *  It describes how deep or flat the world
             *  appears.
             *
             *  @param depth (optional) Value between 10 and 100
             *  @type depth Number
             */
            depth: function (depth) {
                if (depth < 0 || 100 < depth) {
                    exc('The depth must be a value between 0 and 100');
                }

                if (depth !== undefined) {
                    this._depth = depth;
                    this.trigger('depthChanged', depth);
                }

                return this._depth;
            },


            /**
             *  The angle describes the users view of the
             *  world. With a negative angle the lanes in
             *  the distance are better to see. 
             *
             *  @param angle (optional) Value between -45 and 45
             *  @type angle Number
             */
            angle: function (angle) {
                if (angle < -this._maxangle || this._maxangle < angle) {
                    exc('The angle must be a value between -'+ 
                        this._maxangle +' and '+ this._maxangle);
                }

                if (angle !== undefined) {
                    this._angle = angle;
                    this.trigger('angleChanged', angle);
                }

                return this._angle;
            },


            /**
             *  Map the provided value based on
             *  the lanes dist and the worlds depth.
             *  Creates a new point object.
             *
             *  @param dist The lanes dist
             *  @type dist Number
             *  @param p Either an object with x and y 
             *           properties or a number.
             *  @type p Object or Number
             */
            map: function (dist, p) {
                var depthfactor, distfactor, x, y, a;

                x = (p.x === undefined) ? p : p.x;

                distfactor = (100-dist) / 100;
                depthfactor = this.depthfactor() * x;
                x = depthfactor + distfactor * (x - depthfactor);

                if (_(p).isNumber()) {
                    return x;
                }

                a = this.angle();

                y = p.y;
                y *= (a/(-this._maxangle * 100)) * dist + 1 + a/(2 * this._maxangle);
                y = this.height() - y;

                return { x: x, y: y };
            },


            /**
             *  Gets or sets the current position in the world.
             *  
             *  @param pos (optional) New position in the world
             *  @type pos Number
             */
            pos: function (pos) {
                if (_(pos).isNumber()) {

                    console.log(this.character.points);

                    this._pos = pos;
                    this.trigger('posChanged', pos, this.width());
                }
                
                return this._pos;
            }

        });



        /**
         *  RENDERER
         *  ========
         */
         define('core.world.renderer').as({

            /**
             *  Returns the current canvas height
             */
            height: function () {
                //return (this._renderer) ? this._renderer.canvasHeight() : 0;
                console.log((this._renderer) ? this._renderer.canvas.height : 0);
                return (this._renderer) ? this._renderer.canvas.height : 0;
            },

            /**
             *  Returns the current canvas width
             */
            width: function () {
                return (this._renderer) ? this._renderer.canvasWidth() : 0;
            },


            /**
             *  Set or get the renderer. The name must be
             *  a defined renderer, for example "render.canvas".
             *  The renderers constructor gets passed the proxy
             *  that describes all elements that get rendered,
             *  the clock that triggers a "tick" event everytime
             *  something in the proxy changes and the canvas - an
             *  HTML-Element where the world should be drawn.
             *
             *  If no arguments are provided, the currently set
             *  renderer gets returned.
             *
             *  @param name The renderers name
             *  @type name String
             *  @param canvas The element where the world gets drawn to
             *  @type canvas Element
             *
             */
            renderer: function (canvas) {
                var that, clock, proxy;

                if (arguments.length === 0) {
                    return this.renderer;
                }

                if (!_(canvas).isElement()) {
                    exc('renderer: no canvas provided');
                }

                that = this;
                clock = create('util.clock',  1000/this.opts.fps);
                this.broker = create('broker.world',  this, canvas, clock);
                this.canvas = canvas;
                proxy = this.broker.proxy;

                // create
                this._renderer = create(
                    'render.world', proxy, clock, canvas
                );

                // configure
                this.broker.add('lanes', this.lanes);
                return this._renderer;
            }

        });



        /**
         *  STORY
         *  =====
         */
         define('core.world.story').as({

            /**
             *  Add storylines and twists to the world.
             *  Returns a storyline object to configure.
             *
             *  @param name The storylines name
             *  @type name String
             */
            addStoryline: function (name) {
                return this.story.addStoryline(name);
            }

         });


        /**
         *  LANES
         *  =====
         */
        define('core.world.lanes').as({

            /**
             *  Create a new lane. The lane gets appended
             *  to the world. This function returns the created
             *  lane instance.
             *
             *  @param dist A value that describes how deep in the 
             *              world the lane appears
             *  @type dist Number (between 0 and 100)
             */
            createLane: function (dist) {
                var lane, that;

                if (dist < 0 || 100 < dist) {
                    exc('You must provide a correct dist argument');
                }

                if (this.lanes.has(dist)) {
                    exc('A lane in dist '+ lane.dist +' is already defined');
                }

                that = this;
                lane = create('data.lane', dist);

                this.lanes.add(lane);
                return lane;
            },


            /**
             *  Remove a lane from the world.
             *  
             *  @param dist The lanes dist
             *  @type dist Number
             */
            removeLane: function (dist) {
                return this.lanes.del(dist);
            },
        });



        /**
         *  CHARACTER
         *  =========
         */
         define('core.world.character').as({

            /**
             *  TODO (luhuec) comment
             */
            character: function (opts) {
                var that = this;

                if (arguments.length === 0) {
                    return this._character;
                }

                this._character = create('data.character', opts);

                this.broker.add(
                        'character',
                        this._character,
                        this.broker.proxy.character
                    );

                this._character.on('changedPos', function (x, y, dx) {
                    that.pos(x - (that.width() / 2));
                });

                return this._character;
            },


            /**
             *  Puts the character on a lane
             * 
             *  @param dist The chosen lane
             *  @type dist Number
             */
            putCharacter: function (dist) {
                var lane;

                if (!this.character()) {
                    exc('You must provide a character first');
                }

                if (!this.lanes.has(dist)) {
                    exc('Theres no lane at dist ' + dist);
                }

                lane = this.lanes.get(dist);
                this.character().lane = lane;

                return this.character;
            }

         });



        /**
         *  Instances of core.world represent
         *  a norne world consisting of lanes,
         *  a character and decorative elements.
         */
        define('core.world')
            .uses(
                'util.evt',
                'core.world.env',
                'core.world.renderer',
                'core.world.story',
                'core.world.lanes',
                'core.world.character')
            .as(
                function (opts) {

                    // internal constants
                    this._maxangle = 45;

                    // default options
                    var defaults = {
                        depth: 100,
                        angle: 0,
                        fps: 30,
                        pos: 0
                    }, that = this;

                    _(defaults).extend(opts);

                    // properties
                    this.opts = defaults;

                    // maintains
                    this.story = create('core.story', this);
                    this.lanes = create('data.lanes');

                    // configure
                    this.depth(this.opts.depth);
                    this.angle(this.opts.angle);
                    this.pos(this.opts.pos);
                    this.renderer(this.opts.canvas);

                    window.addEventListener('resize', function (evt) {
                        that.broker.broker.lanes.updateCache();
                        that.broker.broker.lanes.updateProxy(true);
                    });
                }
            );

    }());
