class Point {
  /**
   * Point constructor.
   * @constructs Point
   * @param {number} x - X coordinate of the point.
   * @param {number} y - Y coordinate of the point.
   * @param {*} [data] - Data to store along the point.
   */
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
}

class Box {
  /**
   * Box constructor;
   * @constructs Box
   * @param {number} x - X coordinate of the box.
   * @param {number} y - Y coordinate of the box.
   * @param {number} w - Width of the box.
   * @param {number} h - Height of the box.
   * @param {*} [data] - Data to store along the box.
   */
  constructor(x, y, w, h, data) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.data = data;
  }
  /**
   * Check if a point is contained in the box.
   * @param {Point|Object} point - The point to test if it is contained in the box.
   * @returns {boolean} - True if the point is contained in the box, otherwise false.
   */
  contains(point) {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.w &&
      point.y >= this.y &&
      point.y <= this.y + this.h
    );
  }
  /**
   * Check if a box intersects with this box.
   * @param {Box|Object} range - The box to test the intersection with.
   * @returns {boolean} - True if it intersects, otherwise false.
   */
  intersects(range) {
    return !(
      range.x > this.x + this.w ||
      range.x + range.w < this.x ||
      range.y > this.y + this.h ||
      range.y + range.h < this.y
    );
  }
}

class Circle {
  /**
   * Circle constructor;
   * @constructs Circle
   * @param {number} x - X coordinate of the circle.
   * @param {number} y - Y coordinate of the circle.
   * @param {number} r - Radius of the circle.
   */
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rPow2 = this.r * this.r; // To avoid square roots
  }
  euclideanDistancePow2(point1, point2) {
    return Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2);
  }
  /**
   * Check if a point is contained in the circle.
   * @param {Point|Object} point - The point to test if it is contained in the circle.
   * @returns {boolean} - True if the point is contained in the circle, otherwise false.
   */
  contains(point) {
    return this.euclideanDistancePow2(point, this) <= this.rPow2;
  }
  /**
   * Check if a box intersects with this circle.
   * @param {Box|Object} range - The box to test the intersection with.
   * @returns {boolean} - True if it intersects, otherwise false.
   */
  intersects(range) {
    const dX = this.x - Math.max(range.x, Math.min(this.x, range.x + range.w));
    const dY = this.y - Math.max(range.y, Math.min(this.y, range.y + range.h));
    return dX * dX + dY * dY <= this.rPow2;
  }
}

const defaultConfig = {
  capacity: 4,
  removeEmptyNodes: false,
  maximumDepth: -1,
  arePointsEqual: (point1, point2) =>
    point1.x === point2.x && point1.y === point2.y,
};

/**
 * QuadTree class.
 * @class QuadTree
 */
class QuadTree {
  /**
   * Create a new QuadTree
   * @constructor
   * @param {Box} container - The box on which the QuadTree will operate.
   * @param {Object} [config] - The configuration of the quadtree.
   * @param {number} [config.capacity] - The maximum amount of points per node.
   * @param {boolean} [config.removeEmptyNodes] - Specify if the quadtree has to remove subnodes if they are empty.
   * @param {number} [config.maximumDepth] - Specify the maximum depth of the tree.
   * @param {function} [config.arePointsEqual] - Specify a custom method to compare point for removal.
   * @param {(Object[]|Point[])} [points] - An array of initial points to insert in the QuadTree.
   * @param {number} points[].x - X coordinate of the point.
   * @param {number} points[].y - Y coordinate of the point.
   */
  constructor(container, config, points = []) {
    this.container = container;
    this.config = Object.assign({}, defaultConfig, config);
    this.isDivided = false;
    this.points = [];
    for (const point of points) {
      this.insertRecursive(point);
    }
  }
  /**
   * Return a tree representation of the QuadTree
   * @returns {{se: *, sw: *, ne: *, nw: *}|Number} - A tree representation of the QuadTree
   */
  getTree() {
    let tree;
    if (this.isDivided) {
      tree = {
        ne: this.ne.getTree(),
        nw: this.nw.getTree(),
        se: this.se.getTree(),
        sw: this.sw.getTree(),
      };
    } else {
      tree = this.getNodePointAmount();
    }
    return tree;
  }
  /**
   * Get all the points in the QuadTree
   * @returns {(Object[]|Point[])} - An array containing all the points.
   */
  getAllPoints() {
    const pointsList = [];
    this.getAllPointsRecursive(pointsList);
    return pointsList;
  }
  /**
   * Get all the points in the QuadTree
   * @param {(Object[]|Point[])} pointsList
   * @private
   */
  getAllPointsRecursive(pointsList) {
    if (!this.isDivided) {
      Array.prototype.push.apply(pointsList, this.points.slice());
      return;
    }
    this.ne.getAllPointsRecursive(pointsList);
    this.nw.getAllPointsRecursive(pointsList);
    this.se.getAllPointsRecursive(pointsList);
    this.sw.getAllPointsRecursive(pointsList);
  }
  /**
   * Return the amount of points in this node.
   * @returns {number} - The amount of points in this node.
   * @private
   */
  getNodePointAmount() {
    return this.points.length;
  }
  /**
   * Divide this node into 4 sub-nodes
   * @private
   */
  divide() {
    const childMaximumDepth =
      this.config.maximumDepth === -1 ? -1 : this.config.maximumDepth - 1;
    const childConfig = Object.assign({}, this.config, {
      maximumDepth: childMaximumDepth,
    });
    this.isDivided = true;
    const x = this.container.x;
    const y = this.container.y;
    const w = this.container.w / 2;
    const h = this.container.h / 2;
    // Creation of the sub-nodes, and insertion of the current point
    this.ne = new QuadTree(new Box(x + w, y, w, h), childConfig);
    this.nw = new QuadTree(new Box(x, y, w, h), childConfig);
    this.se = new QuadTree(new Box(x + w, y + h, w, h), childConfig);
    this.sw = new QuadTree(new Box(x, y + h, w, h), childConfig);
    this.insert(this.points.slice());
    // We empty this node points
    this.points.length = 0;
    this.points = [];
  }
  /**
   * Remove a point in the QuadTree
   * @param {(Point|Object|Point[]|Object[])} pointOrArray - A point or an array of points to remove
   * @param {number} pointOrArray.x - X coordinate of the point
   * @param {number} pointOrArray.y - Y coordinate of the point
   */
  remove(pointOrArray) {
    if (Array.isArray(pointOrArray)) {
      for (const point of pointOrArray) {
        this.removeRecursive(point);
      }
    } else {
      this.removeRecursive(pointOrArray);
    }
  }
  /**
   * Remove a point in the QuadTree
   * @param {(Point|Object)} point - A point to remove
   * @param {number} point.x - X coordinate of the point
   * @param {number} point.y - Y coordinate of the point
   * @private
   */
  removeRecursive(point) {
    if (!this.container.contains(point)) {
      return;
    }
    if (!this.isDivided) {
      const len = this.points.length;
      for (let i = len - 1; i >= 0; i--) {
        if (this.config.arePointsEqual(point, this.points[i])) {
          this.points.splice(i, 1);
        }
      }
      return;
    }
    this.ne.removeRecursive(point);
    this.nw.removeRecursive(point);
    this.se.removeRecursive(point);
    this.sw.removeRecursive(point);
    if (this.config.removeEmptyNodes) {
      if (
        this.ne.getNodePointAmount() === 0 &&
        !this.ne.isDivided &&
        this.nw.getNodePointAmount() === 0 &&
        !this.nw.isDivided &&
        this.se.getNodePointAmount() === 0 &&
        !this.se.isDivided &&
        this.sw.getNodePointAmount() === 0 &&
        !this.sw.isDivided
      ) {
        this.isDivided = false;
        delete this.ne;
        delete this.nw;
        delete this.se;
        delete this.sw;
      }
    }
  }
  /**
   * Insert a point in the QuadTree
   * @param {(Point|Object|Point[]|Object[])} pointOrArray - A point or an array of points to insert
   * @param {number} pointOrArray.x - X coordinate of the point
   * @param {number} pointOrArray.y - Y coordinate of the point
   * @returns {boolean} true if the point or all the point has been inserted, false otherwise
   */
  insert(pointOrArray) {
    if (Array.isArray(pointOrArray)) {
      let returnValue = true;
      for (const point of pointOrArray) {
        returnValue = returnValue && this.insertRecursive(point);
      }
      return returnValue;
    } else {
      return this.insertRecursive(pointOrArray);
    }
  }
  /**
   * Insert a point in the QuadTree
   * @param {(Point|Object)} point - A point to insert
   * @param {number} point.x - X coordinate of the point
   * @param {number} point.y - Y coordinate of the point
   * @returns {boolean}
   * @private
   */
  insertRecursive(point) {
    if (!this.container.contains(point)) {
      return false;
    }
    if (!this.isDivided) {
      if (
        this.getNodePointAmount() < this.config.capacity ||
        this.config.maximumDepth === 0
      ) {
        this.points.push(point);
        return true;
      } else if (
        this.config.maximumDepth === -1 ||
        this.config.maximumDepth > 0
      ) {
        this.divide();
      }
    }
    if (this.isDivided) {
      return (
        this.ne.insertRecursive(point) ||
        this.nw.insertRecursive(point) ||
        this.se.insertRecursive(point) ||
        this.sw.insertRecursive(point)
      );
    } else {
      return false;
    }
  }
  /**
   * Query all the point within a range
   * @param {Shape} range - The range to test
   * @returns {(Point[]|Object[])} - The points within the range
   */
  query(range) {
    const pointsFound = [];
    this.queryRecursive(range, pointsFound);
    return pointsFound;
  }
  /**
   * @param {Shape} range
   * @param {(Point[]|Object[])} pointsFound
   * @returns {(Point[]|Object[])}
   * @private
   */
  queryRecursive(range, pointsFound) {
    if (range.intersects(this.container)) {
      if (this.isDivided) {
        this.ne.queryRecursive(range, pointsFound);
        this.nw.queryRecursive(range, pointsFound);
        this.se.queryRecursive(range, pointsFound);
        this.sw.queryRecursive(range, pointsFound);
      } else {
        const p = this.points.filter(point => range.contains(point));
        Array.prototype.push.apply(pointsFound, p);
      }
    }
  }
  /**
   * Clear the QuadTree
   */
  clear() {
    this.points = [];
    this.isDivided = false;
    delete this.ne;
    delete this.nw;
    delete this.se;
    delete this.sw;
  }
}
