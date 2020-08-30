class Tile {
    constructor(i, j, x, y, radius) {
        this.indexI = i;
        this.indexJ = j;

        this.pos = createVector(x, y);
        this.radius = radius;
        this.color = "empty";

        this.strokeColor = color(44, 101, 191);
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(Math.PI/2);
        if (this.color == "black") fill(0);
        else if (this.color == "white") fill(255);
        else fill(76, 206, 255);
        strokeWeight(10);
        stroke(this.strokeColor);
        polygon(0, 0, this.radius, 6);
        pop();
    }

    drawHovered() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(Math.PI/2);
        fill(36, 166, 215);
        strokeWeight(10);
        stroke(this.strokeColor);
        polygon(0, 0, this.radius, 6);
        pop();  
    }

    drawMostRecent() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(Math.PI/2);
        if (this.color == "black") fill(0);
        else if (this.color == "white") fill(255);
        else fill(76, 206, 255);
        strokeWeight(10);
        stroke(this.strokeColor);
        polygon(0, 0, this.radius, 6);

        noStroke();
        fill(76, 206, 255);
        ellipse(0, 0, 10, 10);
        pop();
    }
}