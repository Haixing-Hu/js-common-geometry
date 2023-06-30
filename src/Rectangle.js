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
import { eq, lt, gt, isZero } from './Utils';

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
   *    true if the specified vertexes can form a valid rectangle; false
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
   * @param {Point[]} vertexes
   *     the four vertexes of the new rectangle. The vertexes must be in
   *     clockwise order or counter-clockwise order, and they must form a valid
   *     rectangle.
   * @throws Error
   *     If the number of vertexes is not 4, or the 4 vertexes cannot form a
   *     valid rectangle.
   */
  constructor(vertexes) {
    if (!Rectangle.isValid(vertexes)) {
      throw new Error('The vertexes cannot form a valid rectangle.');
    }
    const v = this._makeClockwise(vertexes);
    const j = this._findTopLeftIndex(v);
    const tl = v[j];
    const tr = v[(j + 1) % 4];
    const br = v[(j + 2) % 4];
    const bl = v[(j + 3) % 4];
    this.vertexes = [tl, tr, br, bl];
    // calculate the corners
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
    // calculate the width and height
    this.width = tl.distanceTo(tr);
    this.height = tl.distanceTo(bl);
    // calculate the boundaries
    const min_x = this.vertexes.reduce((a, p) => Math.min(a, p.x), Number.POSITIVE_INFINITY);
    const max_x = this.vertexes.reduce((a, p) => Math.max(a, p.x), Number.NEGATIVE_INFINITY);
    const min_y = this.vertexes.reduce((a, p) => Math.min(a, p.y), Number.POSITIVE_INFINITY);
    const max_y = this.vertexes.reduce((a, p) => Math.max(a, p.y), Number.NEGATIVE_INFINITY);
    this.left = min_x;
    this.right = max_x;
    if (Config.Y_AXIS_DIRECTION === 'up') {
      this.top = max_y;
      this.bottom = min_y;
    } else {
      this.top = min_y;
      this.bottom = max_y;
    }
    Object.freeze(this);
  }

  _makeClockwise(vertexes) {
    const u = vertexes[0].subtract(vertexes[1]);
    const v = vertexes[2].subtract(vertexes[1]);
    if (u.cross(v) > 0) {
      // the vertexes are in the counter-clockwise order, reverse it.
      return [vertexes[0], vertexes[3], vertexes[2], vertexes[1]];
    } else {
      return vertexes;
    }
  }

  _findTopLeftIndex(vertexes) {
    let j = 0;
    for (let i = 1; i < 4; ++i) {
      if (lt(vertexes[i].x, vertexes[j].x)) {
        j = i;
      } else if (eq(vertexes[i].x, vertexes[j].x)) {
        if (Config.Y_AXIS_DIRECTION === 'up') {
          if (gt(vertexes[i].y, vertexes[j].y)) {
            j = i;
          }
        } else {
          if (lt(vertexes[i].y, vertexes[j].y)) {
            j = i;
          }
        }
      }
    }
    return j;
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
    this._left = left;
    this._top = top;
    this._width = width;
    this._height = height;
    this._scale = scale;
    this._rotation = (rotation >= 360 ? rotation % 360 : rotation);
    this._rotationOrigin = rotationOrigin;
    this._translate = translate;
    this._init();
    Object.freeze(this);      //  make this object immutable
  }

  /**
   * Calculates the computed properties of this rectangle.
   *
   * @private
   */
  _init() {
    this.width = this._width * this._scale;
    this.height = this._height * this._scale;
    const tl = new Point(this._left, this._top);
    const tr = new Point(this._left + this.width, this._top);
    const dy = (Config.Y_AXIS_DIRECTION === 'up' ? -this.height : this.height);
    const bl = new Point(this._left, this._top + dy);
    const br = new Point(this._left + this.width, this._top + dy);
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
    if (this._rotation !== 0) {     // need rotation
      // calculate the actual rotation origin
      let o = null;
      if (this._rotationOrigin instanceof Point) {
        o = this._rotationOrigin;
      } else if (typeof this._rotationOrigin === 'string') {
        if (Object.hasOwn(this.corner, this._rotationOrigin)) {
          o = this.corner[this._rotationOrigin];
        }
      }
      if (o === null) {
        throw new Error(`Invalid rotation origin: ${this._rotationOrigin}`);
      }
      // now we will rotate this rectangle around the rotation origin
      const radian = (this._rotation * Math.PI) / 180;
      const sin = Math.sin(radian);
      const cos = Math.cos(radian);
      for (const key in this.corner) {
        if (Object.hasOwn(this.corner, key)) {
          const p = this.corner[key];
          this.corner[key] = p.rotateAroundImpl(o, sin, cos);
        }
      }
    }
    // translates all the corners
    if (!this._translate.isOrigin()) {
      for (const key in this.corner) {
        if (Object.hasOwn(this.corner, key)) {
          const p = this.corner[key];
          this.corner[key] = p.add(this._translate);
        }
      }
    }
    // calculate the left, top, right, bottom boundary
    this._calculate_boundary();
  }

  /**
   * Calculates the left, top, right, bottom boundary of this rectangle.
   *
   * @private
   */
  _calculate_boundary() {
    this.left = Math.min(
      this.corner['top-left'].x,
      this.corner['bottom-left'].x,
      this.corner['top-right'].x,
      this.corner['bottom-right'].x,
    );
    this.right = Math.max(
      this.corner['top-left'].x,
      this.corner['bottom-left'].x,
      this.corner['top-right'].x,
      this.corner['bottom-right'].x,
    );
    if (Config.Y_AXIS_DIRECTION === 'up') {
      this.top = Math.max(
        this.corner['top-left'].y,
        this.corner['bottom-left'].y,
        this.corner['top-right'].y,
        this.corner['bottom-right'].y,
      );
      this.bottom = Math.min(
        this.corner['top-left'].y,
        this.corner['bottom-left'].y,
        this.corner['top-right'].y,
        this.corner['bottom-right'].y,
      );
    } else {
      this.top = Math.min(
        this.corner['top-left'].y,
        this.corner['bottom-left'].y,
        this.corner['top-right'].y,
        this.corner['bottom-right'].y,
      );
      this.bottom = Math.max(
        this.corner['top-left'].y,
        this.corner['bottom-left'].y,
        this.corner['top-right'].y,
        this.corner['bottom-right'].y,
      );
    }
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

  // /**
  //  * Get the array of vertexes of this rectangle.
  //  *
  //  * @return {Point[]}
  //  *    the array of vertexes of this rectangle.
  //  */
  // vertexes() {
  //   return [
  //     this.corner['top-left'],
  //     this.corner['top-right'],
  //     this.corner['bottom-right'],
  //     this.corner['bottom-left'],
  //   ];
  // }

  /**
   * Gets the array of sides of this rectangle.
   *
   * @return {Line[]}
   *    the array of sides of this rectangle.
   */
  sides() {
    return [
      new Line(this.corner['top-left'], this.corner['top-right']),
      new Line(this.corner['top-right'], this.corner['bottom-right']),
      new Line(this.corner['bottom-right'], this.corner['bottom-left']),
      new Line(this.corner['bottom-left'], this.corner['top-left']),
    ];
  }

  /**
   * Gets the polygon representation of this rectangle.
   *
   * @return {Polygon}
   *    the polygon representation of this rectangle.
   */
  toPolygon() {
    return new Polygon(this.vertexes());
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
    const new_a = this.a.rotateAroundImpl(o, sin, cos);
    const new_b = this.b.rotateAroundImpl(o, sin, cos);
    const new_c = this.c.rotateAroundImpl(o, sin, cos);

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
    return new Triangle(this.a.add(delta), this.b.add(delta), this.c.add(delta));
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
  isParallelToAxes() {
    return isZero(this._rotation % 90);
  }

  /**
   * Tests whether this rectangle intersects with another rectangle.
   *
   * @param {Rectangle} other
   *    the other rectangle.
   * @return {boolean}
   *    `true` if this rectangle intersects with the other rectangle; `false`
   *    otherwise.
   */
  isIntersectWith(other) {
    if (this.isParallelToAxes() && other.isParallelToAxes()) {
      if (Config.Y_AXIS_DIRECTION === 'up') {
        return lt(Math.max(this.left, other.left), Math.min(this.right, other.right))
            && lt(Math.max(this.bottom, other.bottom), Math.min(this.top, other.top));
      } else {    // y-axis direction is 'down'
        return lt(Math.max(this.left, other.left), Math.min(this.right, other.right))
            && lt(Math.max(this.top, other.top), Math.min(this.bottom, other.bottom));
      }
    } else {
      return this._intersectWithNonParallel(other);
    }
  }

  _intersectWithNonParallel(other) {
    const thisLines = this._getLines();
    const otherLines = other._getLines();
    for (const thisLine of thisLines) {
      for (const otherLine of otherLines) {
        if (thisLine.isIntersectWith(otherLine)) {
          return true;
        }
      }
    }
    return false;
  }
}

export default Rectangle;
