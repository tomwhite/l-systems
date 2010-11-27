// must work with batik

// TurtleState encapsulates the position and heading of the turtle.
function TurtleState(x, y, direction) {
  this.x = x;
  this.y = y;
  this.direction = direction;
}

// A Plotter holds the path (and its bounds) of a Turtle.
function Plotter() {
  this.path = "M0,0";
  this.minX = 0;
  this.minY = 0;
  this.maxX = 0;
  this.maxY = 0;
}

Plotter.prototype.relocateTo = function(c, x, y) {
  this.path = this.path + " " + c + x + "," + y;
  if (x < this.minX) this.minX = x;
  if (y < this.minY) this.minY = y;
  if (x > this.maxX) this.maxX = x;
  if (y > this.maxY) this.maxY = y;
}

Plotter.prototype.moveTo = function(x, y) {
  this.relocateTo("M", x, y);
}

Plotter.prototype.lineTo = function(x, y) {
  this.relocateTo("L", x, y);
}

// A Turtle executes instructions to manipulate its position and draw lines.
function Turtle(directions) {
  this.state = new TurtleState(0, 0, 0);
  this.stack = [];
  this.directions = directions;
  this.cosines = [];
  this.sines = [];
  for (var i = 0; i < directions; i++) {
    this.cosines[i] = Math.cos(2 * i * Math.PI / directions);
    this.sines[i] = Math.sin(2 * i * Math.PI / directions);
  }
}

Turtle.prototype.executeInstruction = function(c, plotter) {
  switch(c) {
    case 'F':
      this.state = new TurtleState(this.state.x + this.sines[this.state.direction],
                                   this.state.y - this.cosines[this.state.direction],
                                   this.state.direction);
                                 
      plotter.lineTo(this.state.x, this.state.y);
      break;
    case 'f':
      this.state = new TurtleState(this.state.x + this.sines[this.state.direction],
                                   this.state.y - this.cosines[this.state.direction],
                                   this.state.direction);
                                 
      plotter.moveTo(this.state.x, this.state.y);
      break;
    case '+':
      this.state = new TurtleState(this.state.x,
                                   this.state.y,
                                   (this.directions + this.state.direction - 1) % this.directions);
      break;
    case '-':
      this.state = new TurtleState(this.state.x,
                                   this.state.y,
                                   (this.state.direction + 1) % this.directions);
      break;
    case '[':
      this.stack.push(this.state);
      break;
    case ']':
      this.state = this.stack.pop();
      plotter.moveTo(this.state.x, this.state.y);
      break;
  }
}

Turtle.prototype.execute = function(lString) {
  var plotter = new Plotter();
  for (var i = 0; i < lString.length; i++) {
  	this.executeInstruction(lString.charAt(i), plotter);
  }
  return plotter;
}

// Iterate the given L-system to produce a string of commands for
// a Turtle to execute.
function iterate(lSystem, level) {
  var l = lSystem["axiom"];
  for(var i = 0; i < level; i++) {
    l = generate(lSystem, l, "productions");
  }
  return generate(lSystem, l, "symbols");
}

function generate(lSystem, lString, map) {
  if (lSystem[map] == undefined) {
    return lString;
  }
  var r = "";
  for (var i = 0; i < lString.length; i++) {
    var c = lString.charAt(i);
    r += lSystem[map][c] || c;
  }
  return r;
}

// Render the given L-system by setting the
// path data on the SVG element identified by pathId
// and (optionally) set the viewBox to the bounds of the
// rendering.
function showLSystem(lSystem, level, pathId, viewportId) {
  var t = new Turtle(lSystem["directions"]);
  var plotter = t.execute(iterate(lSystem, level));
  document.getElementById(pathId).setAttribute('d', plotter.path);
  if (viewportId != undefined) {
    document.getElementById(viewportId).setAttribute('viewBox', plotter.minX + " " + plotter.minY + " " + (plotter.maxX - plotter.minX) + " " + (plotter.maxY - plotter.minY));
  }
}

