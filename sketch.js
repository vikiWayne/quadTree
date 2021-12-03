// Basic QuadTree

let qTree;
let basePoints = [];

const BUCKET_SIZE = 4;
const TARGET_COUNT = 100;
const BASE_COUNT = 20;
const TOLERANCE = 15;

function setup() {
  createCanvas(600, 600);

  // Creating QuadTree
  let boundary = new Rectangle(width / 2, height / 2, width, height);
  qTree = new QuadTree(boundary, BUCKET_SIZE);

  // Creating base points
  for (let i = 0; i < BASE_COUNT; i++) {
    let x = randomGaussian(width / 2, width / 8);
    let y = randomGaussian(height / 2, height / 8);
    basePoints.push(new Point(x, y));
  }

  // Create and insert Target points into qTree.
  for (let i = 0; i < TARGET_COUNT; i++) {
    let x = randomGaussian(width / 2, width / 8);
    let y = randomGaussian(height / 2, height / 8);
    let p = new Point(x, y, i);
    qTree.insert(p);
  }
}

function draw() {
  background(000);
  qTree.show();
  let choosenPoints = [];

  // stroke(0, 255, 0);
  // strokeWeight(2);
  rectMode(CENTER);
  noFill();

  // // FIND POINTS IN THE GIVEN RECTANGLE - with mouse interaction
  // const range = new Rectangle(mouseX, mouseY, 5, 5);
  // let points = qTree.query(range);
  // // DRAW RECT FOR VISUALIZE POINT SELECTION
  // rect(range.x, range.y, range.width * 2, range.height * 2);

  // for (const p of points) {
  //   strokeWeight(3);
  //   point(p.x, p.y);
  // }

  // finding points on target, within range of all base point
  for (const bp of basePoints) {
    const range = new Rectangle(bp.x, bp.y, TOLERANCE, TOLERANCE);
    const points = qTree.query(range);
    choosenPoints = [...choosenPoints, ...points];
  }

  // A point on target can be within tolerance of multiple base points
  choosenPoints = choosenPoints.filter(
    (point, index, self) => index === self.findIndex(p => p.data === point.data)
  );

  // Highlighting points within range - GREEN
  for (const p of choosenPoints) {
    stroke(0, 255, 0);
    strokeWeight(3);
    point(p.x, p.y);
  }

  // show base points - RED
  for (const p of basePoints) {
    stroke(255, 0, 0);
    strokeWeight(3);
    point(p.x, p.y);
    strokeWeight(0.5);
    rect(p.x, p.y, TOLERANCE * 2, TOLERANCE * 2);
  }
}

// COLLISION DETECTION

// let particles = [];

// function setup() {
//   createCanvas(600, 400);

//   for (let i = 0; i < 1000; i++) {
//     let particle = new Particle(random(width), random(height));
//     particles[i] = particle;
//   }
// }

// function draw() {
//   background(0);

//   // setting up QuadTree
//   const boundary = new Rectangle(300, 200, 600, 400);
//   let qTree = new QuadTree(boundary, 4);

//   for (let p of particles) {
//     let point = new Point(p.x, p.y, p);
//     qTree.insert(point);

//     p.move();
//     p.render();
//     p.setHighlight(false);
//   }

//   for (p of particles) {
//     let range = new Circle(p.x, p.y, p.r * 2);
//     let points = qTree.query(range);
//     for (const point of points) {
//       let other = point.data;
//       if (p !== other && p.intersects(other)) {
//         p.setHighlight(true);
//       }
//     }
//   }
// }
