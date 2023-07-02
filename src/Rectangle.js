/******************************************************************************
 *                                                                            *
 *    Copyright (c) 2023.                                                     *
 *    Haixing Hu                                                              *
 *                                                                            *
 *    All rights reserved.                                                    *
 *                                                                            *
 ******************************************************************************/
import Config from './Config';
import Point from './Point';
import Line from './Line';
import Polygon from './Polygon';
import { eq, lt, normalize, calculateBoundaries, geq, leq, isZero, isPositive } from './Utils';

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
      this.vertexes = vertexes.slice();
    } else {
      if (!Rectangle.isValid(vertexes)) {
        throw new Error('The vertexes cannot form a valid rectangle.');
      }
      this.vertexes = normalize(vertexes);
    }
    this.a = this.vertexes[0];
    this.b = this.vertexes[1];
    this.c = this.vertexes[2];
    this.d = this.vertexes[3];
    // calculate the corners
    this._calculateCorners();
    // calculate the width and height
    this._calculateDimension();
    // calculate the boundaries
    const boundary = calculateBoundaries(this.vertexes);
    this.left = boundary.left;
    this.right = boundary.right;
    this.top = boundary.top;
    this.bottom = boundary.bottom;
    // make this object immutable
    Object.freeze(this);
  }

  _calculateCorners() {
    const [tl, tr, br, bl] = this.vertexes;
    this.corner = {
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
    this.width = this.vertexes[0].distanceTo(this.vertexes[1]);
    this.height = this.vertexes[0].distanceTo(this.vertexes[3]);
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
    const corner = {
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
        if (Object.hasOwn(corner, rotationOrigin)) {
          o = corner[rotationOrigin];
        }
      }
      if (o === null) {
        throw new Error(`Invalid rotation origin: ${rotationOrigin}`);
      }
      // now we will rotate this rectangle around the rotation origin
      const radian = (rotation * Math.PI) / 180;
      const sin = Math.sin(radian);
      const cos = Math.cos(radian);
      for (const key in corner) {
        if (Object.hasOwn(corner, key)) {
          const p = corner[key];
          corner[key] = p.rotateAroundImpl(o, sin, cos);
        }
      }
    }
    // translates all the corners
    if (!translate.isOrigin()) {
      for (const key in corner) {
        if (Object.hasOwn(corner, key)) {
          const p = corner[key];
          corner[key] = p.add(translate);
        }
      }
    }
    const vertexes = [
      corner['top-left'],
      corner['top-right'],
      corner['bottom-right'],
      corner['bottom-left'],
    ];
    return new Rectangle(vertexes, true);
  }

  /**
   * Gets the array of sides of this rectangle.
   *
   * @return {Line[]}
   *    the array of sides of this rectangle.
   */
  sides() {
    return this.vertexes.map((p, i) => new Line(p, this.vertexes[(i + 1) % 4]));
  }

  /**
   * The top-left point of this rectangle.
   *
   * @return {Point}
   *    the top-left point of this rectangle.
   */
  get topLeft() {
    return this.corner['top-left'];
  }

  /**
   * The top-center point of this rectangle.
   *
   * @return {Point}
   *     the top-center point of this rectangle.
   */
  get topCenter() {
    return this.corner['top-center'];
  }

  /**
   * The top-right point of this rectangle.
   *
   * @return {Point}
   *    the top-right point of this rectangle.
   */
  get topRight() {
    return this.corner['top-right'];
  }

  /**
   * The middle-left point of this rectangle.
   *
   * @return {Point}
   *     the middle-left point of this rectangle.
   */
  get middleLeft() {
    return this.corner['middle-left'];
  }

  /**
   * The center point of this rectangle.
   *
   * @return {Point}
   *     the center point of this rectangle.
   */
  get center() {
    return this.corner['center'];
  }

  /**
   * The middle-right point of this rectangle.
   *
   * @return {Point}
   *    the middle-right point of this rectangle.
   */
  get middleRight() {
    return this.corner['middle-right'];
  }

  /**
   * The bottom-left point of this rectangle.
   *
   * @return {Point}
   *     the bottom-left point of this rectangle.
   */
  get bottomLeft() {
    return this.corner['bottom-left'];
  }

  /**
   * The bottom-center point of this rectangle.
   *
   * @return {Point}
   *     the bottom-center point of this rectangle.
   */
  get bottomCenter() {
    return this.corner['bottom-center'];
  }

  /**
   * The bottom-right point of this rectangle.
   *
   * @return {Point}
   *    the bottom-right point of this rectangle.
   */
  get bottomRight() {
    return this.corner['bottom-right'];
  }

  /**
   * Gets the polygon representation of this rectangle.
   *
   * @return {Polygon}
   *    the polygon representation of this rectangle.
   */
  asPolygon() {
    return new Polygon(this.vertexes);
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
    const newVertexes = this.vertexes.map((p) => p.rotateAroundImpl(o, sin, cos));
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
    const newVertexes = this.vertexes.map((p) => p.add(delta));
    // note that the translated vertexes is also normalized
    return new Rectangle(newVertexes, true);
  }

  /**
   * Gets the anchor point of this rectangle.
   *
   * @param {string} anchor
   *    the position of the anchor point to get, which may have the following
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
  anchorPoint(anchor) {
    if (Object.hasOwn(this.corner, anchor)) {
      return this.corner[anchor];
    } else {
      throw new Error(`Unknown anchor point: ${anchor}`);
    }
  }

  /**
   * Gets the left side of this rectangle.
   *
   * @return {Line}
   *     the left side of this rectangle.
   */
  leftSide() {
    return new Line(this.corner['top-left'], this.corner['bottom-left']);
  }

  /**
   * Gets the top side of this rectangle.
   *
   * @return {Line}
   *     the top side of this rectangle.
   */
  topSide() {
    return new Line(this.corner['top-left'], this.corner['top-right']);
  }

  /**
   * Gets the right side of this rectangle.
   *
   * @return {Line}
   *    the right side of this rectangle.
   */
  rightSide() {
    return new Line(this.corner['top-right'], this.corner['bottom-right']);
  }

  /**
   * Gets the bottom side of this rectangle.
   *
   * @return {Line}
   *    the bottom side of this rectangle.
   */
  bottomSide() {
    return new Line(this.corner['bottom-left'], this.corner['bottom-right']);
  }

  /**
   * Gets the area of this rectangle.
   *
   * @return {number}
   *     the area of this rectangle.
   */
  area() {
    return this.width * this.height;
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
    return eq(this.vertexes[0].x, this.left)
        && eq(this.vertexes[0].y, this.top);
  }

  /**
   * Tests whether this rectangle is inside the another rectangle.
   *
   * @param {Rectangle} other
   *    the other rectangle.
   * @return {boolean}
   *    `true` if this rectangle inside the other rectangle; `false` otherwise.
   *    Note that if two rectangle are the same, or this rectangle is inside the
   *    other rectangle and this rectangle is adjacent to the other rectangle
   *    (i.e., any vertex of this rectangle lines on the side of the other
   *    rectangle), this method also returns `true`.
   */
  isInsideRectangle(other) {
    if (this.isParallelToAxis() && other.isParallelToAxis()) {
      if (Config.Y_AXIS_DIRECTION === 'up') {
        return geq(this.left, other.left)
            && leq(this.right, other.right)
            && leq(this.top, other.top)
            && geq(this.bottom, other.bottom);
      } else {
        return geq(this.left, other.left)
            && leq(this.right, other.right)
            && geq(this.top, other.top)
            && leq(this.bottom, other.bottom);
      }
    } else {
      const otherSides = other.sides();
      // this rectangle is inside the other rectangle, if and only if all the
      // vertexes of this rectangle, either lies on a side of the other rectangle,
      // or lies on the right of all sides of the other rectangle.
      for (let i = 0; i < 4; ++i) {
        const p = this.vertexes[i];
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
  relationToRectangle(other) {
    if (this.equals(other)) {
      return 'same';
    } else if (this.isInsideRectangle(other)) {
      if (this.vertexes.some((v) => v.isOnRectangle(other))) {
        return 'inside_adjacently';
      } else {
        return 'inside_exactly';
      }
    } else if (other.isInsideRectangle(this)) {
      if (other.vertexes.some((v) => v.isOnRectangle(this))) {
        return 'include_adjacently';
      } else {
        return 'include_exactly';
      }
    }
    // TODO

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
      if (!this.vertexes[i].equals(other.vertexes[i])) {
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
      const result = this.vertexes[i].compareTo(t.vertexes[i]);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  }
}

export default Rectangle;
