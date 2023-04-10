"use strict";
$(document).ready(function(){main();})

function addVertex(canvas,x,y){
    var v=new fabric.Circle({
        radius:5,
        fill:"black",
        left:x-5,
        top:y-5,
    });
    canvas.add(v);
    canvas.renderAll();
}
function main() {
    var canvas=new fabric.Canvas("c");
    console.log("I'm here");

    canvas.on("mouse:down",function(options){
        addVertex(canvas,options.e.clientX,options.e.clientY);
        console.log("Add a vertex");
    })

}
