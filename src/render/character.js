
    /*
     * Character Renderer
     */
    define('render.character')
        .as({

            render: function (proxy) {
                if (this.imgLoaded) {
                    this.paintCharacter(proxy);
                    return;
                }

                if (!this.imageLoaded && proxy.image) {
                    this.setImageSource(proxy.image);
                }
            },

            paintCharacter: function (proxy) {
                var frame = proxy.frame;

                if (!frame) {
                    return;
                }
                
                this.ctx.beginPath();
                this.ctx.translate(proxy.x, proxy.y);
                this.ctx.rotate(-proxy.angle);
                this.ctx.scale(proxy.direction,1);
                
                this.ctx.drawImage(
                        this.image, // image to draw
                        frame.x,    // clipping x-coord
                        frame.y,    // clipping y-coord

                        frame.width,    // width of the clipped frame
                        frame.height,   // height of the clipped frame
                        
                        0 - (proxy.width / 2),        // x-position on canvas
                        0 - proxy.height + 5,             // y-position on canvas
                        
                        proxy.width,    // width of shown image
                        proxy.height    // height of shown image
                    );
                

                this.ctx.rotate(proxy.angle);
                this.ctx.translate(-proxy.x, -proxy.y);
                this.ctx.scale(proxy.direction,1);
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.ctx.restore();
                this.ctx.closePath();
            },

            setImageSource: function (image) {
                var that = this;

                this.image = new Image();
                this.image.src = image;
                
                this.image.onload = function () {
                    that.imgLoaded = true;
                };
            } 

        }, function (canvas) {

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');

            this.imgLoaded = false;
        });
