class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 4;
    this.highlight = false;
  }

  move() {
    this.x += random(-1, 1);
    this.y += random(-1, 1);
  }

  setHighlight(value) {
    this.highlight = value;
  }

  intersects(value) {
    let d = dist(this.x, this.y, value.x, value.y);
    return d < this.r + value.r;
  }

  render() {
    noStroke();
    if (this.highlight) {
      fill(255);
    } else {
      fill(100);
    }
    ellipse(this.x, this.y, this.r * 2);
  }
}
