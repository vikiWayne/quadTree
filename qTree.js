class Point {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
}

class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // checks a point is within the boundary
  // point is a instance of Point
  contains(point) {
    return (
      point.x >= this.x - this.width &&
      point.x <= this.x + this.width &&
      point.y >= this.y - this.height &&
      point.y <= this.y + this.height
    );
  }

  intersects(range) {
    // range is a instance of Rectange
    return !(
      range.x - range.w > this.x + this.width ||
      range.x + range.w < this.x - this.width ||
      range.y - range.h > this.y + this.height ||
      range.y + range.h < this.y - this.height
    );
  }
}

// circle class for a circle shaped query
class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rSquared = this.r * this.r;
  }

  contains(point) {
    // check if the point is in the circle by checking if the euclidean distance of
    // the point and the center of the circle if smaller or equal to the radius of
    // the circle
    let d = Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2);
    return d <= this.rSquared;
  }

  intersects(range) {
    let xDist = Math.abs(range.x - this.x);
    let yDist = Math.abs(range.y - this.y);

    // radius of the circle
    let r = this.r;

    let w = range.w / 2;
    let h = range.h / 2;

    let edges = Math.pow(xDist - w, 2) + Math.pow(yDist - h, 2);

    // no intersection
    if (xDist > r + w || yDist > r + h) return false;

    // intersection within the circle
    if (xDist <= w || yDist <= h) return true;

    // intersection on the edge of the circle
    return edges <= this.rSquared;
  }
}

//   N
// W . E
//   S

class QuadTree {
  // boundary - the outer rectangle of the quadTree.
  // capacity - Maximum capacity of a section. If exceeds, quadTree is subdivided
  constructor(boundary, capacity) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subDivide() {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.width;
    let h = this.boundary.height;

    let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
    this.northEast = new QuadTree(ne, this.capacity);

    let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
    this.southEast = new QuadTree(se, this.capacity);

    let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
    this.southWest = new QuadTree(sw, this.capacity);

    let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
    this.northWest = new QuadTree(nw, this.capacity);

    this.divided = true;
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    } else {
      // if the capacity is full, subdivide
      if (!this.divided) {
        this.subDivide();
      }

      if (this.northEast.insert(point)) {
        return true;
      } else if (this.southEast.insert(point)) {
        return true;
      } else if (this.southWest.insert(point)) {
        return true;
      } else if (this.northWest.insert(point)) {
        return true;
      }
    }
  }

  // retreive points in a given range
  query(range, found = []) {
    // Checks the range is inside qTree.
    if (!this.boundary.intersects(range)) {
      return found;
    }

    for (const p of this.points) {
      if (range.contains(p)) {
        found.push(p);
      }
    }

    if (this.divided) {
      this.northWest.query(range, found);
      this.northEast.query(range, found);
      this.southWest.query(range, found);
      this.southEast.query(range, found);
    }

    return found;
  }

  remove() {
    this.points = [];
    this.divided = false;
  }

  // for visual representation
  show() {
    stroke(255);
    strokeWeight(1);

    noFill();
    // rectMode(CENTER);
    // rect(
    //   this.boundary.x,
    //   this.boundary.y,
    //   this.boundary.width * 2,
    //   this.boundary.height * 2
    // );
    if (this.divided) {
      this.northEast.show();
      this.southEast.show();
      this.southWest.show();
      this.northWest.show();
    }

    for (let p of this.points) {
      strokeWeight(3);
      point(p.x, p.y);
    }
  }
}
