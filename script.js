"use strict";
$(document).ready(function(){main();})

// Global variables
let vertices=[];
let capacities={};
let prev;
let prev_color;
let cur_color;
let cur;
let step=0;

// Helper Functions
function AddVertex(canvas,x,y,color){
    let v=new fabric.Circle({
        radius:10,
        fill:color,
        left:x-5,
        top:y-5,
    });
    console.log(v.type);
    v.selectable=false;
    vertices.push(v);
    canvas.add(v);
    canvas.renderAll();
}

function AddDirectedLine(canvas,coords,color){
    let ang;
    if(coords[1]===coords[3]){
        ang=90;
    }else if (coords[1]<coords[3]){
        ang=180-Math.atan((coords[2]-coords[0])/(coords[3]-coords[1]))*180/Math.PI;
    }else{
        ang=Math.atan((coords[2]-coords[0])/(coords[1]-coords[3]))*180/Math.PI;
    }
    let l=new fabric.Line(coords,{
        fill: color,
        stroke: color,
    });
    let t=new fabric.Triangle({
        width:10,
        height:17,
        fill:color,
        left:(coords[0]+coords[2])/2-5,
        top:(coords[1]+coords[3])/2-8.5,
    });
    t.rotate(ang);
    let g=new fabric.Group([l,t]);
    g.selectable=false;
    canvas.add(g);
    g.sendToBack();
    canvas.renderAll();
}

function Handle(ins,b1,inp,canvas){
    if (step===0){
        ins.text("Click on canvas to add S.");
        b1.hide();
        step=1;
    }else if (step===2){
        ins.text("Click on canvas to add T.");
        step=3;
    }else if (step===4){
        ins.text("Click on canvas to add other vertices. Click \"Done\" when finished.")
        b1.text("Done")
        b1.show();
        step=5;
    }else if(step===5){
        step=6;
        Handle(ins,b1,inp,canvas);
    }else if(step===6){
        b1.hide();
        ins.text("Now add edges by connecting vertices. Select a vertex on canvas.")
        step=7;
    }else if(step===8){
        ins.text("Select another vertex where the edge points to.")
        step=9;
    }else if(step===10){
        inp.show();
        b1.text("Enter");
        b1.show();
        ins.text("Now enter the integer capacity on this edge to the input box below. Click \"Enter\" when finished.");
        step=11;
    }else if(step===11){//doesn't allow multigraph for now
        // if there is an edge between prev and cur already don't do anything
        inp.hide();
        b1.text("Finish");
        ins.text("Select a vertex on canvas to add more edges. Or click \"Finish\" to move on.");
        prev.setFill(prev_color);
        cur.setFill(cur_color);
        let index1=vertices.indexOf(prev);
        let index2=vertices.indexOf(cur);
        let str;
        if(index1<index2){
            str=index1.toString()+":"+index2.toString();
        }else{
            str=index2.toString()+":"+index1.toString()
        }
        if(str in capacities){
            capacities[str]=inp.val();
        }else{
            capacities[str]=inp.val();
            let p1=prev.getCenterPoint();
            let p2=cur.getCenterPoint();
            AddDirectedLine(canvas,[p1.x,p1.y,p2.x,p2.y],"black")
            //draw line and triangle
        }
        step=12;
    }else if(step===12){
        b1.text("OK");
        ins.text("Now let's demonstrate how the algorithm works.");
    }
}

function HandleCanvas(ins,b1,inp,canvas,options){
    if(step===1){
        if(!options.target){
            let ptr=canvas.getPointer(options.e,true);
            AddVertex(canvas,ptr.x,ptr.y,"blue");
            step=2;
            Handle(ins,b1,inp,canvas);
        }
    }else if(step===3){
        if(!options.target){
            let ptr=canvas.getPointer(options.e,true);
            AddVertex(canvas,ptr.x,ptr.y,"blue");
            step=4;
            Handle(ins,b1,inp,canvas);
        }
    }else if(step===5){
        if(!options.target){
            let ptr=canvas.getPointer(options.e,true);
            AddVertex(canvas,ptr.x,ptr.y,"black");
        }
    }else if(step===7 || step===12){
        if(options.target){
            if(options.target.type==="circle"){
                prev=options.target;
                prev_color=prev.fill;
                prev.setFill("red");
                step=8;
                Handle(ins,b1,inp,canvas);
            }
        }
    }else if(step===9){
        if(options.target){
            cur=options.target;
            cur_color=cur.fill;
            cur.setFill("red");
            step=10;
            Handle(ins,b1,inp,canvas);
        }
    }
}
function main() {
    let canvas = new fabric.Canvas("c",{selection:false});
    canvas.setWidth($(window).outerWidth()*0.45);
    canvas.setHeight(600);

    const ins=$("#instruction");
    const b1=$("#b1");
    const inp=$("#input");

    ins.text("Let's first create a graph.");
    b1.text("OK");
    inp.hide();

    b1.click(function(){
        Handle(ins,b1,inp,canvas);
    });

    canvas.on("mouse:down",function(options){
        HandleCanvas(ins,b1,inp,canvas,options);
    });

}
