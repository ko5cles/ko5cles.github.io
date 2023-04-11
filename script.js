"use strict";
$(document).ready(function(){main();})

function addVertex(canvas,x,y){
    var v=new fabric.Circle({
        radius:5,
        fill:"black",
        left:x-5,
        top:y-5,
    });
    v.set('selectable',false)
    canvas.add(v);
    canvas.renderAll();
}
function main() {
    var canvas=new fabric.Canvas("c");
    canvas.setWidth($(window).outerWidth()*0.45);
    canvas.setHeight(600);

    canvas.on("mouse:down",function(options){
        if(options.target){
            options.target.setFill("Red");}
        else {
            var ptr=canvas.getPointer(options.e,true);
            addVertex(canvas,ptr.x,ptr.y);
        }
    });

}
