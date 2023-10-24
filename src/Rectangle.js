////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import Config from './Config';
import Point from './Point';
import LineSegment from './LineSegment';
import {
  eq,
  geq,
  leq,
  isPositive,
  normalize,
  calculateBoundaries,
  modulo,
} from './Utils';

/**
 * The class represents a rectangle on the plane.
 *
 * This class is immutable.
 *
 * @author Haixing Hu
 */
class Rectangle {
  /**
   * Tests whether the specified vertexes can form a valid rectangle.
   *
   * @param {Point[]} vertexes
   *    the array of four vertexes to test.
   * @returns {boolean}
   *    `true` if the specified vertexes can form a valid rectangle; `false`
   *    otherwise.
   */
  static isValid(vertexes) {
    if (!Array.isArray(vertexes)) {
      return false;
    }
    if (vertexes.length !== 4) {
      return false;
    }
    // the four vertexes form a valid rectangle if and only if the lengths of the
    // opposite sides are equal, and the lengths of the diagonals are equal.
    return (!vertexes[0].equals(vertexes[1]))
      && (!vertexes[1].equals(vertexes[2]))
      && eq(vertexes[0].distanceTo(vertexes[1]), vertexes[2].distanceTo(vertexes[3]))
      && eq(vertexes[1].distanceTo(vertexes[2]), vertexes[3].distanceTo(vertexes[0]))
      && eq(vertexes[0].distanceTo(vertexes[2]), vertexes[1].distanceTo(vertexes[3]));
  }

  /**
   * Constructs a rectangle.
   *
   * The constructor must be provided with four vertexes of a rectangle. The
   * vertexes could be in clockwise order or counter-clockwise order, but they
   * must form a valid rectangle.
   *
   * The constructor will normalize the vertexes, that is, it will reorder the
   * vertexes in the clockwise order, and select the top-left vertex as the
   * first vertex.
   *
   * The top-left vertex is the vertex with the largest or smallest y-coordinate
   * (depending on the direction of the y-axis, i.e.,
   * `Config.Y_AXIS_DIRECTION === 'up'` or `Config.Y_AXIS_DIRECTION === 'down'`),
   * and among all the vertexes with the same y-coordinate, the one with the
   * smallest x-coordinate.
   *
   * @param {Point[]} vertexes
   *     the four vertexes of the new rectangle. The vertexes must be in
   *     clockwise order or counter-clockwise order, and they must form a valid
   *     rectangle.
   * @param {boolean} normalized
   *     Indicates whether the specified vertexes are normalized. If the
   *     specified vertexes are normalized, they will be copied to the new
   *     rectangle; otherwise, they will be normalized and then copied to the
   *     new rectangle. The default value of this argument is `false`.
   * @throws Error
   *     If the number of vertexes is not 4, or the 4 vertexes cannot form a
   *     valid rectangle.
   */
  constructor(vertexes, normalized = false) {
    if (normalized) {
      this._vertexes = vertexes.slice();
    } else {
      if (!Rectangle.isValid(vertexes)) {
        throw new Error('The vertexes cannot form a valid rectangle.');
      }
      this._vertexes = normalize(vertexes);
    }
    this.a = this._vertexes[0];
    this.b = this._vertexes[1];
    this.c = this._vertexes[2];
    this.d = this._vertexes[3];
    // calculate the corners
    this._calculateCorners();
    // calculate the width and height
    this._calculateDimension();
    // calculate the boundaries
    this._boundary = calculateBoundaries(this._vertexes);
    // make this object immutable
    Object.freeze(this);
  }

  _calculateCorners() {
    const [tl, tr, br, bl] = this._vertexes;
    this._corners = {
      'top-left': tl,
      'top-right': tr,
      'top-center': new Point((tl.x + tr.x) / 2, (tl.y + tr.y) / 2),
      'bottom-left': bl,
      'bottom-right': br,
      'bottom-center': new Point((bl.x + br.x) / 2, (bl.y + br.y) / 2),
      'middle-left': new Point((tl.x + bl.x) / 2, (tl.y + bl.y) / 2),
      'middle-right': new Point((tr.x + br.x) / 2, (tr.y + br.y) / 2),
      'center': new Point((tl.x + br.x) / 2, (tl.y + br.y) / 2),
    };
  }

  _calculateDimension() {
    this._width = this._vertexes[0].distanceTo(this._vertexes[1]);
    this._height = this._vertexes[0].distanceTo(this._vertexes[3]);
  }

  /**
   * Creates a rectangle.
   *
   * @param {number} left
   *    the x-coordinate of the left side of the original rectangle.
   * @param {number} top
   *    the y-coordinate of the top side of the original rectangle.
   * @param {number} width
   *    the width of the rectangle.
   * @param {number} height
   *    the height of the rectangle.
   * @param {number} scale
   *    the scale of the rectangle.
   * @param {number} rotation
   *    the rotation of the rectangle, in degree.
   * @param {Point|string} rotationOrigin
   *    the rotation origin of the rectangle. If it is a `Point` object, it
   *    specifies the rotation origin of the rectangle. If it is a string, it
   *    specifies the anchor position in the rectangle. The string can be one
   *    of the following values:
   *    - 'top-left': the top-left corner of the rectangle.
   *    - 'top-center': the top-center of the rectangle.
   *    - 'top-right': the top-right corner of the rectangle.
   *    - 'middle-left': the middle-left of the rectangle.
   *    - 'center': the center of the rectangle.
   *    - 'middle-right': the middle-right of the rectangle.
   *    - 'bottom-left': the bottom-left corner of the rectangle.
   *    - 'bottom-center': the bottom-center of the rectangle.
   *    - 'bottom-right': the bottom-right corner of the rectangle.
   * @param {Point} translate
   *    the translation of the rectangle, which specifies the offset of the
   *    rectangle from the origin.
   */
  static create(left, top, width, height, scale = 1, rotation = 0,
    rotationOrigin = 'center', translate = new Point(0, 0)) {
    width *= scale;
    height *= scale;
    const tl = new Point(left, top);
    const tr = new Point(left + width, top);
    const dy = (Config.Y_AXIS_DIRECTION === 'up' ? -height : height);
    const bl = new Point(left, top + dy);
    const br = new Point(left + width, top + dy);
    const corners = {
      'top-left': tl,
      'top-right': tr,
      'top-center': new Point((tl.x + tr.x) / 2, (tl.y + tr.y) / 2),
      'bottom-left': bl,
      'bottom-right': br,
      'bottom-center': new Point((bl.x + br.x) / 2, (bl.y + br.y) / 2),
      'middle-left': new Point((tl.x + bl.x) / 2, (tl.y + bl.y) / 2),
      'middle-right': new Point((tr.x + br.x) / 2, (tr.y + br.y) / 2),
      'center': new Point((tl.x + br.x) / 2, (tl.y + br.y) / 2),
    };
    rotation %= 360;
    if (rotation !== 0) {   // need rotation
      let o = null;
      if (rotationOrigin instanceof Point) {
        o = rotationOrigin;
      } else if (typeof rotationOrigin === 'string') {
        if (Object.hasOwn(corners, rotationOrigin)) {
          o = corners[rotationOrigin];
        }
      }
      if (o === null) {
        throw new Error(`Invalid rotation origin: ${rotationOrigin}`);
      }
      // now we will rotate this rectangle around the rotation origin
      const radian = (rotation * Math.PI) / 180;
      const sin = Math.sin(radian);
      const cos = Math.cos(radian);
      for (const key in corners) {
        if (Object.hasOwn(corners, key)) {
          const p = corners[key];
          corners[key] = p.rotateImpl(o, sin, cos);
        }
      }
    }
    // translates all the corners
    if (!translate.isOrigin()) {
      for (const key in corners) {
        if (Object.hasOwn(corners, key)) {
          const p = corners[key];
          corners[key] = p.add(translate);
        }
      }
    }
    const vertexes = [
      corners['top-left'],
      corners['top-right'],
      corners['bottom-right'],
      corners['bottom-left'],
    ];
    return new Rectangle(vertexes, true);
  }

  /**
   * Gets the array of vertexes of this rectangle.
   *
   * @return {Point[]}
   *    the array of vertexes of this rectangle.
   */
  vertexes() {
    return this._vertexes;
  }

  /**
   * Gets the array of sides of this rectangle.
   *
   * @return {LineSegment[]}
   *    the array of sides of this rectangle.
   */
  sides() {
    return this._vertexes.map((p, i) => new LineSegment(p, this._vertexes[(i + 1) % 4]));
  }

  /**
   * Gets the specified vertex of this rectangle.
   *
   * @param {number} i
   *     the index of the specified vertex to get. If this index is outside the
   *     range of `[0, 4)`, it will be treated as module 4.
   * @returns {Point}
   *     the specified vertex of this rectangle.
   */
  vertex(i) {
    return this._vertexes[modulo(i, 4)];
  }

  /**
   * Gets the specified side of this rectangle.
   *
   * @param {number} i
   *     the index of the specified side to get. If this index is outside the
   *     range of `[0, 4)`, it will be treated as module 4.
   * @return {LineSegment}
   *     the specified side of this rectangle.
   */
  side(i) {
    const u = this._vertexes[modulo(i, 4)];
    const v = this._vertexes[modulo(i + 1, 4)];
    return new LineSegment(u, v);
  }

  /**
   * Gets the left side of this rectangle.
   *
   * @return {LineSegment}
   *     the left side of this rectangle.
   */
  leftSide() {
    return new LineSegment(this._corners['top-left'], this._corners['bottom-left']);
  }

  /**
   * Gets the top side of this rectangle.
   *
   * @return {LineSegment}
   *     the top side of this rectangle.
   */
  topSide() {
    return new LineSegment(this._corners['top-left'], this._corners['top-right']);
  }

  /**
   * Gets the right side of this rectangle.
   *
   * @return {LineSegment}
   *    the right side of this rectangle.
   */
  rightSide() {
    return new LineSegment(this._corners['top-right'], this._corners['bottom-right']);
  }

  /**
   * Gets the bottom side of this rectangle.
   *
   * @return {LineSegment}
   *    the bottom side of this rectangle.
   */
  bottomSide() {
    return new LineSegment(this._corners['bottom-left'], this._corners['bottom-right']);
  }

  /**
   * The top-left point of this rectangle.
   *
   * @return {Point}
   *    the top-left point of this rectangle.
   */
  topLeft() {
    return this._corners['top-left'];
  }

  /**
   * The top-center point of this rectangle.
   *
   * @return {Point}
   *     the top-center point of this rectangle.
   */
  topCenter() {
    return this._corners['top-center'];
  }

  /**
   * The top-right point of this rectangle.
   *
   * @return {Point}
   *    the top-right point of this rectangle.
   */
  topRight() {
    return this._corners['top-right'];
  }

  /**
   * The middle-left point of this rectangle.
   *
   * @return {Point}
   *     the middle-left point of this rectangle.
   */
  middleLeft() {
    return this._corners['middle-left'];
  }

  /**
   * The center point of this rectangle.
   *
   * @return {Point}
   *     the center point of this rectangle.
   */
  center() {
    return this._corners['center'];
  }

  /**
   * The middle-right point of this rectangle.
   *
   * @return {Point}
   *    the middle-right point of this rectangle.
   */
  middleRight() {
    return this._corners['middle-right'];
  }

  /**
   * The bottom-left point of this rectangle.
   *
   * @return {Point}
   *     the bottom-left point of this rectangle.
   */
  bottomLeft() {
    return this._corners['bottom-left'];
  }

  /**
   * The bottom-center point of this rectangle.
   *
   * @return {Point}
   *     the bottom-center point of this rectangle.
   */
  bottomCenter() {
    return this._corners['bottom-center'];
  }

  /**
   * The bottom-right point of this rectangle.
   *
   * @return {Point}
   *    the bottom-right point of this rectangle.
   */
  bottomRight() {
    return this._corners['bottom-right'];
  }

  /**
   * Gets the specified corner of this rectangle.
   *
   * @param {string} position
   *    the position of the corner to get, which may have the following
   *    values:
   *    - 'top-left': the top-left corner of the rectangle.
   *    - 'top-center': the top-center of the rectangle.
   *    - 'top-right': the top-right corner of the rectangle.
   *    - 'middle-left': the middle-left of the rectangle.
   *    - 'center': the center of the rectangle.
   *    - 'middle-right': the middle-right of the rectangle.
   *    - 'bottom-left': the bottom-left corner of the rectangle.
   *    - 'bottom-center': the bottom-center of the rectangle.
   *    - 'bottom-right': the bottom-right corner of the rectangle.
   */
  corner(position) {
    if (Object.hasOwn(this._corners, position)) {
      return this._corners[position];
    } else {
      throw new Error(`Unknown corner position: ${position}`);
    }
  }

  /**
   * Gets the left boundary of this rectangle, i.e., the smallest x-coordinate of
   * all the vertexes of this rectangle.
   *
   * @return {number}
   *    the left boundary of this rectangle.
   */
  left() {
    return this._boundary.left;
  }

  /**
   * Gets the right boundary of this rectangle, i.e., the largest x-coordinate of
   * all the vertexes of this rectangle.
   *
   * @return {number}
   *    the right boundary of this rectangle.
   */
  right() {
    return this._boundary.right;
  }

  /**
   * Gets the top boundary of this rectangle, i.e., the largest or smallest
   * y-coordinate of all the vertexes of this rectangle, depending on the value of
   * Config.Y_AXIS_DIRECTION.
   *
   * @return {number}
   *    the top boundary of this rectangle.
   * @see Config.Y_AXIS_DIRECTION
   */
  top() {
    return this._boundary.top;
  }

  /**
   * Gets the bottom boundary of this rectangle, i.e., the smallest or largest
   * y-coordinate of all the vertexes of this rectangle, depending on the value of
   * Config.Y_AXIS_DIRECTION.
   *
   * @return {number}
   *    the bottom boundary of this rectangle.
   * @see Config.Y_AXIS_DIRECTION
   */
  bottom() {
    return this._boundary.bottom;
  }

  /**
   * Gets the width of this rectangle.
   *
   * @return {number}
   *    the width of this rectangle.
   */
  width() {
    return this._width;
  }

  /**
   * Gets the height of this rectangle.
   *
   * @return {number}
   *    the height of this rectangle.
   */
  height() {
    return this._height;
  }

  /**
   * Gets the bounding rectangle of this rectangle.
   *
   * @return {Rectangle}
   *    the bounding rectangle of this rectangle.
   */
  boundingRectangle() {
    const vertexes = [
      new Point(this._boundary.left, this._boundary.top),
      new Point(this._boundary.right, this._boundary.top),
      new Point(this._boundary.right, this._boundary.bottom),
      new Point(this._boundary.left, this._boundary.bottom),
    ];
    return new Rectangle(vertexes, true);
  }

  /**
   * Gets the area of this rectangle.
   *
   * @return {number}
   *     the area of this rectangle.
   */
  area() {
    return this._width * this._height;
  }

  /**
   * Rotates this rectangle by a given angle around a given point.
   *
   * @param {Point} o
   *     The point around which the rotation is performed.
   * @param {number} angle
   *     The angle of rotation, in radians.
   * @return {Rectangle}
   *     A new `Rectangle` object representing the result triangle after rotating
   *     this triangle around the given point by the given angle.
   */
  rotate(o, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newVertexes = this._vertexes.map((p) => p.rotateImpl(o, sin, cos));
    // note that the rotated vertexes may not be normalized, since the top-left
    // vertex may not be the top-left vertex after rotation.
    return new Rectangle(newVertexes, false);
  }

  /**
   * Translate this rectangle by the specified displacement.
   *
   * @param {Point} delta
   *    The vector represents the displacement by which this rectangle is
   *    translated.
   * @return {Rectangle}
   *    A new `Rectangle` object representing the result rectangle after
   *    translating this rectangle by the specified displacement.
   */
  translate(delta) {
    const newVertexes = this._vertexes.map((p) => p.add(delta));
    // note that the translated vertexes is also normalized
    return new Rectangle(newVertexes, true);
  }

  /**
   * Tests whether this rectangle is parallel to the x and y axes.
   *
   * @return {boolean}
   *     `true` if this rectangle is parallel to the x and y axes; `false`
   *     otherwise.
   */
  isParallelToAxis() {
    // note that if the rectangle is parallel to the x and y axes, and if its
    // vertexes are normalized, the y-coordinate of the first vertex must be
    // equal to the top boundary of the rectangle (which is always true for a
    // normalized rectangle), and the x-coordinate of the first vertex must be
    // equal to the left boundary of the rectangle (which is true for rectangles
    // parallel to axis).
    return eq(this._vertexes[0].x, this._boundary.left)
        && eq(this._vertexes[0].y, this._boundary.top);
  }

  /**
   * Checks if this rectangle is equal to another rectangle.
   *
   * Note that a rectangle is equal to another rectangle if and only if all their
   * vertexes are equal.
   *
   * @param {Rectangle} other
   *    Another rectangle.
   * @return {boolean}
   *    `true` if this rectangle is equal to the other rectangle, `false`
   *    otherwise.
   */
  equals(other) {
    for (let i = 0; i < 4; ++i) {
      if (!this._vertexes[i].equals(other._vertexes[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Compares this rectangle with another rectangle
   *
   * The function will compare the vertexes of two rectangles in the clockwise
   * order.
   *
   * @param {Rectangle} t
   *     Another rectangle.
   * @return {number}
   *     A negative value if this rectangle is less than the other rectangle, a
   *     positive value if this rectangle is greater than the other rectangle,
   *     or zero if this rectangle equals the other rectangle.
   */
  compareTo(t) {
    for (let i = 0; i < 4; ++i) {
      const result = this._vertexes[i].compareTo(t._vertexes[i]);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  }

  /**
   * Tests whether this rectangle is inside the another rectangle.
   *
   * @param {Rectangle} other
   *    the other rectangle.
   * @return {boolean}
   *    `true` if this rectangle inside the other rectangle; `false` otherwise.
   *    A rectangle is inside another rectangle if and only if all the points
   *    inside or on the side of it lies inside or on the side of the other
   *    rectangle. Therefore, if two rectangle are the same, or this rectangle
   *    is inside the other rectangle and this rectangle is adjacent to the
   *    other rectangle (i.e., any vertex of this rectangle lines on the side of
   *    the other rectangle), this method also returns `true`.
   */
  isInside(other) {
    if (this.isParallelToAxis() && other.isParallelToAxis()) {
      if (Config.Y_AXIS_DIRECTION === 'up') {
        return geq(this._boundary.left, other._boundary.left)
            && leq(this._boundary.right, other._boundary.right)
            && leq(this._boundary.top, other._boundary.top)
            && geq(this._boundary.bottom, other._boundary.bottom);
      } else {
        return geq(this._boundary.left, other._boundary.left)
            && leq(this._boundary.right, other._boundary.right)
            && geq(this._boundary.top, other._boundary.top)
            && leq(this._boundary.bottom, other._boundary.bottom);
      }
    } else {
      const otherSides = other.sides();
      // this rectangle is inside the other rectangle, if and only if all the
      // vertexes of this rectangle, either lies on any side of the other
      // rectangle, or lies on the right of all sides of the other rectangle.
      for (let i = 0; i < 4; ++i) {
        const p = this._vertexes[i];
        for (let j = 0; j < 4; ++j) {
          const s = otherSides[j];
          const u = s.end.subtract(s.start);
          const v = p.subtract(s.start);
          const r = u.cross(v);
          if (isPositive(r)) {
            // p lies on the "left" side of s
            return false;
          }
        }
      }
      return true;
    }
  }

  /**
   * Computes the relationship between this rectangle and another rectangle.
   *
   * @param {Rectangle} other
   *    The other rectangle, which may or may not be parallel to the x-y axes.
   * @return {string}
   *    The relationship between this rectangle and the specified rectangle. It
   *    can be the following possible values:
   *    - 'inside_exactly': indicates that this rectangle is exactly inside the
   *      other rectangle, and no vertex of this rectangle lies on the side of
   *      the other rectangle.
   *    - 'inside_adjacently': indicates that this rectangle is inside the other
   *      rectangle, and a vertex of this rectangle lies on the side of the
   *      other rectangle.
   *    - 'include_exactly': indicates that the other rectangle is exactly inside
   *       this rectangle, and no vertex of the other rectangle lies on the side
   *       of this rectangle.
   *    - 'include_adjacently': indicates that the other rectangle is exactly
   *      inside this rectangle, and a vertex of the other rectangle lies on the
   *      side of this rectangle.
   *    - 'same': indicates that this rectangle is exactly the same as the other
   *      rectangle;
   *    - 'disjoint_exactly': indicates that this rectangle is exactly disjoint
   *       with the other rectangle, and no vertex of one rectangle lies on the
   *       side of the other rectangle.
   *    - 'disjoint_adjacently': indicates that this rectangle is disjoint with
   *      the other rectangle, and a vertex of one rectangle lies on the side of
   *      the other rectangle.
   *    - 'intersect': indicates that this rectangle intersects with the
   *      other rectangle, i.e., they are neither disjoint nor inside each other,
   *      which means that they have some common area and some disjoint area.
   */
  relationTo(other) {
    if (this.equals(other)) {
      return 'same';
    } else if (this.isInside(other)) {
      if (this._vertexes.some((v) => v.isOnRectangle(other))) {
        return 'inside_adjacently';
      } else {
        return 'inside_exactly';
      }
    } else if (other.isInside(this)) {
      if (other._vertexes.some((v) => v.isOnRectangle(this))) {
        return 'include_adjacently';
      } else {
        return 'include_exactly';
      }
    }
    // TODO

  }
}

export default Rectangle;
