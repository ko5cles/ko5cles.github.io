"use strict";
$(document).ready(function () {
    main();
})

// Global variables
let vertices = [];
let capacities = {};
let prev;
let prev_color;
let cur_color;
let cur;
let step = 0;
let capacities_matrix = [];
let flow_matrix = [];
let reverse_matrix = [];
let leftover_matrix = [];
let maximum_capacity = 0;
let edges = {};

function Radius2Degree(rad) {
    return rad * 180 / Math.PI;
}

// Helper Functions
function PrintMatrix(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            console.log(matrix[i][j]);
        }
        console.log("---");
    }
}

function AddVertex(canvas, x, y, color) {
    let v = new fabric.Circle({
        radius: 10,
        fill: color,
        left: x - 5,
        top: y - 5,
    });
    v.selectable = false;
    vertices.push(v);
    canvas.add(v);
}

function AddDirectedLine(canvas, coords, color, weight, position = 'up') {
    if (typeof weight !== "string") {
        weight = weight.toString();
    }
    let ang;
    if (coords[1] === coords[3]) {
        ang = 90;
    } else if (coords[1] < coords[3]) {
        ang = 180 - Math.atan((coords[2] - coords[0]) / (coords[3] - coords[1])) * 180 / Math.PI;
    } else {
        ang = Math.atan((coords[2] - coords[0]) / (coords[1] - coords[3])) * 180 / Math.PI;
    }
    let l = new fabric.Line(coords, {
        fill: color,
        stroke: color,
    });
    let t = new fabric.Triangle({
        width: 10,
        height: 17,
        fill: color,
        left: (coords[0] + coords[2]) / 2 - 5,
        top: (coords[1] + coords[3]) / 2 - 8.5,
    });
    t.rotate(ang);
    if (position === 'up') {
        let text = new fabric.Text(weight, {
            fontSize: 10,
            left: (coords[0] + coords[2]) / 2 - 5,
            top: (coords[1] + coords[3]) / 2 - 20,
            fill: color,
        })

        let g = new fabric.Group([l, t, text]);
        g.selectable = false;
        canvas.add(g);
        g.sendToBack();
        return g;
    } else {
        let text = new fabric.Text(weight, {
            fontSize: 10,
            left: (coords[0] + coords[2]) / 2 + 5,
            top: (coords[1] + coords[3]) / 2 + 15,
            fill: color,
        })

        let g = new fabric.Group([l, t, text]);
        g.selectable = false;
        canvas.add(g);
        g.sendToBack();
        return g;
    }
}

function AddLOLine(canvas, coords, weight) {
    coords[1] = coords[1] - 10;
    coords[3] = coords[3] - 10;
    let g = AddDirectedLine(canvas, coords, '#FF1493', weight);
    return g;
}

function AddRLine(canvas, coords, weight) {
    coords[1] = coords[1] + 10;
    coords[3] = coords[3] + 10;
    let g = AddDirectedLine(canvas, coords, '#00008B', weight, 'down');
    return g;
}

function AddFLine(canvas, coords, flow, capacity) {
    let str = flow.toString() + "/" + capacity.toString();
    AddDirectedLine(canvas, coords, "black", str);
}

function ClearResidualMatrix() {
    for (let i = 0; i < vertices.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            leftover_matrix[i][j] = -1;
            reverse_matrix[i][j] = -1;
        }
    }
}

function CalculateResidualMatrix() {
    ClearResidualMatrix();
    for (let i = 0; i < vertices.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            if (capacities_matrix[i][j] !== -1) {
                leftover_matrix[i][j] = capacities_matrix[i][j] - flow_matrix[i][j];
                reverse_matrix[j][i] = flow_matrix[i][j];
            }
        }
    }
}

function ClearEdges() {
    for (const member in edges) {
        delete edges[member];
    }
}

function DrawResidualNetwork(canvas) {
    ClearEdges();
    for (let i = 0; i < vertices.length; i++) {
        canvas.add(vertices[i]);
    }
    CalculateResidualMatrix();
    for (let i = 0; i < vertices.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            if (leftover_matrix[i][j] !== -1) {
                let p1 = vertices[i].getCenterPoint();
                let p2 = vertices[j].getCenterPoint();
                let g = AddLOLine(canvas, [p1.x, p1.y, p2.x, p2.y], leftover_matrix[i][j]);
                let str = i.toString() + ":" + j.toString();
                edges[str] = g;
            }
            if (reverse_matrix[i][j] !== -1) {
                let p1 = vertices[i].getCenterPoint();
                let p2 = vertices[j].getCenterPoint();
                let g = AddRLine(canvas, [p1.x, p1.y, p2.x, p2.y], reverse_matrix[i][j]);
                let str = i.toString() + ":" + j.toString();
                edges[str] = g;
            }
        }
    }
    canvas.renderAll();
}

function DrawFlowNetwork(canvas) {
    for (let i = 0; i < vertices.length; i++) {
        canvas.add(vertices[i]);
    }
    for (let i = 0; i < vertices.length; i++) {
        for (let j = 0; j < vertices.length; j++) {
            let c = capacities_matrix[i][j];
            if (c !== -1) {
                let p1 = vertices[i].getCenterPoint();
                let p2 = vertices[j].getCenterPoint();
                let f = flow_matrix[i][j];
                AddFLine(canvas, [p1.x, p1.y, p2.x, p2.y], f, c);
            }
        }
    }
    canvas.renderAll();
}


class Node {
    constructor(parent, index, weight) {
        this.parent = parent;
        this.index = index;
        this.weight = weight;
    }
}

function BFS() {
    let visited = [];
    for (let i = 0; i < vertices.length; i++) {
        visited.push(0);
    }
    let queue = [];
    let root = new Node(null, 0, null);
    let path_existed = false;
    queue.push(root);
    visited[0] = 1;
    let v;
    while (queue.length !== 0 && !path_existed) {
        v = queue.shift();
        let index = v.index;
        for (let j = 0; j < vertices.length; j++) {
            if (index === 1) {// T is found
                path_existed = true;
                break;
            }
            if (leftover_matrix[index][j] !== -1 && leftover_matrix[index][j] !== 0) { //an edge exist from v
                if (visited[j] === 0) {//that child node has not been visited
                    visited[j] = 1;
                    let temp = new Node(v, j, leftover_matrix[index][j]);
                    queue.push(temp)
                }
            }
            if (reverse_matrix[index][j] !== -1 && reverse_matrix[index][j] !== 0) {
                if (visited[j] === 0) {//that child node has not been visited
                    visited[j] = 1;
                    let temp = new Node(v, j, reverse_matrix[index][j]);
                    queue.push(temp)
                }
            }
        }
    }
    let min_weight = Infinity;
    let index_list = [];
    if (path_existed) {
        while (v.parent !== null) {
            if (v.weight < min_weight) {
                min_weight = v.weight;
            }
            index_list.push(v.index);
            v = v.parent;
        }
        index_list.push(v.index);
        return [true, min_weight, index_list];
    } else {
        return [false, null, null];
    }
}

function OutlinePathResidualNetwork(index_list) {
    for (let i = 0; i < index_list.length - 1; i++) {
        let str = index_list[i].toString() + ":" + index_list[i + 1].toString();
        let g = edges[str];
        g.item(0).setStroke("#006400");
        g.item(1).setFill("#006400");
        g.item(2).setFill("#006400");
    }
}

function UpdateFlowMatrix(min_weight, index_list) {

    for (let i = 0; i < index_list.length - 1; i++) {
        if (flow_matrix[index_list[i]][index_list[i + 1]] === -1) {
            flow_matrix[index_list[i + 1]][index_list[i]] -= min_weight;
        } else {
            flow_matrix[index_list[i]][index_list[i + 1]] += min_weight;
        }

    }
}

function Handle(ins, b1, inp, canvas, subcanvas) {
    if (step === 0) {
        ins.text("Click on canvas to add S.");
        b1.hide();
        step = 1;
    } else if (step === 2) {
        ins.text("Click on canvas to add T.");
        step = 3;
    } else if (step === 4) {
        ins.text("Click on canvas to add other vertices. Click \"Done\" when finished.")
        b1.text("Done")
        b1.show();
        step = 5;
    } else if (step === 5) {
        step = 6;
        Handle(ins, b1, inp, canvas);
    } else if (step === 6) {
        b1.hide();
        ins.text("Now add edges by connecting vertices. Select a vertex as the starting point on canvas.")
        step = 7;
    } else if (step === 8) {
        ins.text("Select another vertex where the edge points to.")
        step = 9;
    } else if (step === 10) {
        inp.show();
        b1.text("Enter");
        b1.show();
        ins.text("Now enter the integer capacity on this edge to the input box below. Click \"Enter\" when finished.");
        step = 11;
    } else if (step === 11) {//doesn't allow multigraph for now
        // if there is an edge between prev and cur already don't do anything
        inp.hide();
        b1.text("Finish");
        ins.text("Select a vertex on canvas to add more edges. Or click \"Finish\" to move on.");
        prev.setFill(prev_color);
        cur.setFill(cur_color);
        let index1 = vertices.indexOf(prev);
        let index2 = vertices.indexOf(cur);
        let str = index1.toString() + ":" + index2.toString();
        if (str in capacities) {
            capacities[str] = inp.val();
        } else {
            capacities[str] = inp.val();
            let p1 = prev.getCenterPoint();
            let p2 = cur.getCenterPoint();
            AddDirectedLine(canvas, [p1.x, p1.y, p2.x, p2.y], "black", inp.val());
            canvas.renderAll();
            //draw line and triangle
        }
        step = 12;
    } else if (step === 12) {
        b1.text("OK");
        ins.text("Now let's demonstrate how the algorithm works.");
        // construct flow_matrix and capacity_matrix
        for (let i = 0; i < vertices.length; i++) {
            let temp = [];
            let zeros = [];
            let negatives = [];
            let negative = [];
            for (let j = 0; j < vertices.length; j++) {
                negatives.push(-1);
                negative.push(-1);
                let str = i.toString() + ":" + j.toString();
                if (str in capacities) {
                    temp.push(capacities[str]);
                    zeros.push(0);
                } else {
                    temp.push(-1);
                    zeros.push(-1);
                }
            }
            flow_matrix.push(zeros);
            capacities_matrix.push(temp);
            reverse_matrix.push(negative);
            leftover_matrix.push(negatives);
            step = 13;
        }
    } else if (step === 13) {
        ins.text("Let's construct a residual network on the right canvas (again). (Initially, all the edges have flows of 0.)");
        b1.text("Next");
        HandleCanvas(ins, b1, inp, canvas, subcanvas, null);
    } else if (step === 14) {
        ins.text("Then we will apply BFS to search a path from S to T.");
        HandleCanvas(ins, b1, inp, canvas, subcanvas, null);
    } else if (step === 15) {
        ins.text("After finding a path, we update the flow graph below and add the minimum weight in the path to our maximum capacity.");
        HandleCanvas(ins, b1, inp, canvas, subcanvas, null);
    } else if (step === 16) {
        b1.hide();
        ins.text("It looks like there is no such path from S to T. Hence we get our maximum capacity=" + maximum_capacity.toString() + ".");
        step = 17;
    }
}

function HandleCanvas(ins, b1, inp, canvas, subcanvas, options) {
    if (step === 1) {
        if (!options.target) {
            let ptr = canvas.getPointer(options.e, true);
            AddVertex(canvas, ptr.x, ptr.y, "blue");
            canvas.renderAll();
            step = 2;
            Handle(ins, b1, inp, canvas);
        }
    } else if (step === 3) {
        if (!options.target) {
            let ptr = canvas.getPointer(options.e, true);
            AddVertex(canvas, ptr.x, ptr.y, "blue");
            canvas.renderAll();
            step = 4;
            Handle(ins, b1, inp, canvas);
        }
    } else if (step === 5) {
        if (!options.target) {
            let ptr = canvas.getPointer(options.e, true);
            AddVertex(canvas, ptr.x, ptr.y, "black");
            canvas.renderAll();
        }
    } else if (step === 7 || step === 12) {
        if (options.target) {
            if (options.target.type === "circle") {
                prev = options.target;
                prev_color = prev.fill;
                prev.setFill("red");
                step = 8;
                Handle(ins, b1, inp, canvas);
            }
        }
    } else if (step === 9) {
        if (options.target) {
            if (options.target.type === "circle") {
                cur = options.target;
                cur_color = cur.fill;
                cur.setFill("red");
                step = 10;
                Handle(ins, b1, inp, canvas);
            }
        }
    } else if (step === 13) {
        canvas.clear();
        DrawFlowNetwork(canvas);
        subcanvas.clear();
        DrawResidualNetwork(subcanvas);
        step = 14;
    } else if (step === 14) {
        let result = BFS();
        if (result[0] === true) {
            maximum_capacity += result[1];
            result[2].reverse();
            OutlinePathResidualNetwork(result[2]);
            subcanvas.renderAll();
            UpdateFlowMatrix(result[1], result[2]);
            step = 15;
        } else {
            step = 16;
        }
    } else if (step === 15) {
        canvas.clear();
        DrawFlowNetwork(canvas);
        step = 13;
    }
}

function main() {
    let canvas = new fabric.Canvas("c", {selection: false});
    canvas.setWidth($(window).innerWidth() * 0.45);
    canvas.setHeight(600);

    let subcanvas = new fabric.Canvas("c1", {selection: false});
    subcanvas.setWidth($(window).innerWidth() * 0.45);
    subcanvas.setHeight(600);

    const ins = $("#instruction");
    const b1 = $("#b1");
    const inp = $("#input");

    ins.text("Let's first create a graph on the canvas below.");
    b1.text("OK");
    inp.hide();

    b1.click(function () {
        Handle(ins, b1, inp, canvas, subcanvas);
    });

    canvas.on("mouse:down", function (options) {
        HandleCanvas(ins, b1, inp, canvas, subcanvas, options);
    });

}
