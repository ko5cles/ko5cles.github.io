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
let capacities_matrix=[];
let flow_matrix=[];
let reverse_matrix=[];
let leftover_matrix=[]

function Radius2Degree(rad){
    return rad*180/Math.PI;
}
// Helper Functions
function PrintMatrix(matrix){
    for(let i=0;i<matrix.length;i++){
        for(let j=0;j<matrix[0].length;j++){
            console.log(matrix[i][j]);
        }
        console.log("---");
    }
}
function AddVertex(canvas,x,y,color){
    let v=new fabric.Circle({
        radius:10,
        fill:color,
        left:x-5,
        top:y-5,
    });
    v.selectable=false;
    vertices.push(v);
    canvas.add(v);
    canvas.renderAll();
}

function AddDirectedLine(canvas,coords,color,weight){
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
    let text=new fabric.Text(weight.toString(),{
        fontSize:10,
        left:(coords[0]+coords[2])/2-5,
        top:(coords[1]+coords[3])/2-20,
        fill:color,
    })
    let g=new fabric.Group([l,t,text]);
    g.selectable=false;
    canvas.add(g);
    g.sendToBack();
    canvas.renderAll();
}
function AddCurvedLine(canvas,coords,color,x,weight){
    console.log("I'm drawing a curved line");
    let x1=coords[0];
    let y1=coords[1];
    let x2=coords[2];
    let y2=coords[3];
    let d=Math.sqrt((x2-x1)**2+(y2-y1)**2);
    let c=d/2;
    let r=(x**2+c**2)/(2*x);
    console.log("r:",r,"x1y1x2y2:",x1,y1,x2,y2,"d",d,"c",c);
    if(y1===y2){
        let angle=Radius2Degree(Math.acos(Math.abs(x2-x1)/(2*r)));
        let c_up= new fabric.Circle({
            radius: r,
            left:(x1+x2)/2-r,
            top:(y1-x),
            stroke:color,
            fill:"",
            startAngle: 180+angle,
            endAngle: 360-angle,
        });
        let c_down=new fabric.Circle({
            radius: r,
            left:(x1+x2)/2-r,
            top:(y1-2*r+x),
            stroke:color,
            fill:"",
            startAngle: angle,
            endAngle: 180-angle,
        })
        canvas.add(c_up);
        canvas.add(c_down);
    }else{
        let A=(y2-y1)/(x2-x1);
        let B=-1;
        let C=y1-(y2-y1)/(x2-x1)*x1;
        let k_prime=(x1-x2)/(y2-y1);
        let b_prime=(y2+y1)/2-(x1**2-x2**2)/(2*y2-2*y1);
        let x01=(Math.sqrt(A**2+B**2)*(r-x)-B-b_prime-C)/(A+B*k_prime);
        let x02=(-Math.sqrt(A**2+B**2)*(r-x)-B-b_prime-C)/(A+B*k_prime);
        let y01=k_prime*x01+b_prime;
        let y02=k_prime*x02+b_prime;
        if(y1<y2){
            console.log("x01,y01:");
            console.log(x01,y01);
            if(x01<x2){
                let angle1=Radius2Degree(Math.acos((x2-x01)/r));
                let angle2=Radius2Degree(Math.acos((x01-x1)/r));
                let c_up= new fabric.Circle({
                    radius: r,
                    left:(x1+x2)/2-r,
                    top:(y1-x),
                    stroke:color,
                    fill:"",
                    startAngle: 180+angle1,
                    endAngle: 360-angle2,
                });
                canvas.add(c_up);
            }else{
                let angle1=Radius2Degree(Math.acos((x01-x2)/r));
                let angle2=Radius2Degree(Math.acos((x01-x1)/r));
                let c_up= new fabric.Circle({
                    radius: r,
                    left:(x1+x2)/2-r,
                    top:(y1-x),
                    stroke:color,
                    fill:"",
                    startAngle: 360-angle1,
                    endAngle: 360-angle2,
                });
                canvas.add(c_up);
            }
        }else{

        }
    }
}

function ClearResidualMatrix(){
    for(let i=0;i<vertices.length;i++){
        for(let j=0;j<vertices.length;j++){
            leftover_matrix[i][j]=-1;
            reverse_matrix[i][j]=-1;
        }
    }
}
function CalculateResidualMatrix(){
    ClearResidualMatrix();
    for(let i=0;i<vertices.length;i++){
        for(let j=0;j<vertices.length;j++){
            if(capacities_matrix[i][j]!==-1){
                leftover_matrix[i][j]=capacities_matrix[i][j]-flow_matrix[i][j];
                reverse_matrix[j][i]=flow_matrix[i][j];
            }
        }
    }
}
function DrawResidualNetwork(canvas){
    for(let i=0;i<vertices.length;i++){
        canvas.add(vertices[i]);
    }
    CalculateResidualMatrix();
    for(let i=0;i<vertices.length;i++){
        for(let j=0;j<vertices.length;j++){
            if(leftover_matrix[i][j]!==-1){
                let p1=vertices[i].getCenterPoint();
                let p2=vertices[j].getCenterPoint();
                AddCurvedLine(canvas,[p1.x,p1.y,p2.x,p2.y],'black',5,0);
            }
        }
    }
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
        let str=index1.toString()+":"+index2.toString();
        if(str in capacities){
            capacities[str]=inp.val();
        }else{
            capacities[str]=inp.val();
            let p1=prev.getCenterPoint();
            let p2=cur.getCenterPoint();
            AddDirectedLine(canvas,[p1.x,p1.y,p2.x,p2.y],"black",inp.val());
            //draw line and triangle
        }
        step=12;
    }else if(step===12){
        b1.text("OK");
        ins.text("Now let's demonstrate how the algorithm works.");
        // construct flow_matrix and capacity_matrix
        for(let i=0;i<vertices.length;i++){
            let temp=[];
            let zeros=[];
            let negatives=[];
            let negative=[];
            for(let j=0;j<vertices.length;j++){
                negatives.push(-1);
                negative.push(-1);
                let str=i.toString()+":"+j.toString();
                if(str in capacities){
                    temp.push(capacities[str]);
                    zeros.push(0);
                }else{
                    temp.push(-1);
                    zeros.push(-1);
                }
            }
            flow_matrix.push(zeros);
            capacities_matrix.push(temp);
            reverse_matrix.push(negative);
            leftover_matrix.push(negatives);
            step=13;
        }
    }else if(step===13){
        ins.text("Let's first construct a residual network. We'll first assume all the edges have flows of 0");
        b1.text("Next");
        HandleCanvas(ins,b1,inp,canvas,null);
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
    }else if(step===13){
        canvas.clear();
        DrawResidualNetwork(canvas);
        step=14;
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
