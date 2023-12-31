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

/**
 * The class represents a rectangle on the plane.
 *
 * This class is immutable.
 *
 * @author Haixing Hu
 */
class Rectangle {
  /**
   * Constructs a rectangle.
   *
   * @param {number} left
   *    the x-coordinate of the left side of the rectangle.
   * @param {number} top
   *    the y-coordinate of the top side of the rectangle.
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
   * @param {string} yAxisDirection
   *    the oriented direction of the y-axis.
   */
  constructor(left,
              top,
              width,
              height,
              scale = 1,
              rotation = 0,
              rotationOrigin = 'center',
              translate = new Point(0, 0),
              yAxisDirection = Config.DEFAULT_Y_AXIS_DIRECTION) {
    this._left = left;
    this._top = top;
    this._width = width;
    this._height = height;
    this._scale = scale;
    this._rotation = rotation;
    this._rotationOrigin = rotationOrigin;
    this._translate = translate;
    this._yDirection = yAxisDirection;
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
    const delta = (this._yDirection === 'up' ? -this.height : this.height);
    const tl = new Point(this._left, this._top);
    const tr = new Point(this._left + this.width, this._top);
    const bl = new Point(this._left, this._top + delta);
    const br = new Point(this._left + this.width, this._top + delta);
    this._corner = {
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
    if ((this._rotation % 360) !== 0) { // need rotation
      // calculate the actual rotation origin
      let rotationOrigin = null;
      if (this._rotationOrigin instanceof Point) {
        rotationOrigin = this._rotationOrigin;
      } else if (typeof this._rotationOrigin === 'string') {
        if (this._corner.hasOwnProperty(this._rotationOrigin)) {
          rotationOrigin = this._corner[this._rotationOrigin];
        }
      }
      if (rotationOrigin === null) {
        throw new Error(`Invalid rotation origin: ${this._rotationOrigin}`);
      }
      // now we will rotate this rectangle around the rotation origin
      const rotationRadian = this._rotation * Math.PI / 180;
      const cos = Math.cos(rotationRadian);
      const sin = Math.sin(rotationRadian);
      const dx = rotationOrigin.x * (1 - cos) + rotationOrigin.y * sin;
      const dy = rotationOrigin.y * (1 - cos) - rotationOrigin.x * sin;
      for (let key in this._corner) {
        if (this._corner.hasOwnProperty(key)) {
          const p = this._corner[key];
          this._corner[key] = new Point(p.x * cos - p.y * sin + dx,
                                        p.x * sin + p.y * cos + dy);
        }
      }
    }
    // translates all the corners
    if (!this._translate.isOrigin()) {
      for (let key in this._corner) {
        if (this._corner.hasOwnProperty(key)) {
          const p = this._corner[key];
          this._corner[key] = p.add(this._translate);
        }
      }
    }
  }

  /**
   * The top-left point of this rectangle.
   *
   * @return {Point}
   *    the top-left point of this rectangle.
   */
  get topLeft() {
    return this._corner['top-left'];
  }

  /**
   * The top-center point of this rectangle.
   *
   * @return {Point}
   *     the top-center point of this rectangle.
   */
  get topCenter() {
    return this._corner['top-center'];
  }

  /**
   * The top-right point of this rectangle.
   *
   * @return {Point}
   *    the top-right point of this rectangle.
   */
  get topRight() {
    return this._corner['top-right'];
  }

  /**
   * The middle-left point of this rectangle.
   *
   * @return {Point}
   *     the middle-left point of this rectangle.
   */
  get middleLeft() {
    return this._corner['middle-left'];
  }

  /**
   * The center point of this rectangle.
   *
   * @return {Point}
   *     the center point of this rectangle.
   */
  get center() {
    return this._corner['center'];
  }

  /**
   * The middle-right point of this rectangle.
   *
   * @return {Point}
   *    the middle-right point of this rectangle.
   */
  get middleRight() {
    return this._corner['middle-right'];
  }

  /**
   * The bottom-left point of this rectangle.
   *
   * @return {Point}
   *     the bottom-left point of this rectangle.
   */
  get bottomLeft() {
    return this._corner['bottom-left'];
  }

  /**
   * The bottom-center point of this rectangle.
   *
   * @return {Point}
   *     the bottom-center point of this rectangle.
   */
  get bottomCenter() {
    return this._corner['bottom-center'];
  }

  /**
   * The bottom-right point of this rectangle.
   *
   * @return {Point}
   *    the bottom-right point of this rectangle.
   */
  get bottomRight() {
    return this._corner['bottom-right'];
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
    if (this._corner.hasOwnProperty(anchor)) {
      return this._corner[anchor];
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
    return new Line(this._corner['top-left'],
                    this._corner['bottom-left']);
  }

  /**
   * Gets the top side of this rectangle.
   *
   * @return {Line}
   *     the top side of this rectangle.
   */
  topSide() {
    return new Line(this._corner['top-left'],
                    this._corner['top-right']);
  }

  /**
   * Gets the right side of this rectangle.
   *
   * @return {Line}
   *    the right side of this rectangle.
   */
  rightSide() {
    return new Line(this._corner['top-right'],
                    this._corner['bottom-right']);
  }

  /**
   * Gets the bottom side of this rectangle.
   *
   * @return {Line}
   *    the bottom side of this rectangle.
   */
  bottomSide() {
    return new Line(this._corner['bottom-left'],
                    this._corner['bottom-right']);
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
   * Tests whether this rectangle intersects with another rectangle.
   *
   * @param {Rectangle} other
   *    the other rectangle.
   * @return {boolean}
   *    `true` if this rectangle intersects with the other rectangle; `false`
   *    otherwise.
   */
  isIntersectWith(other) {
    // FIXME
    return (Math.max(this._topLeft.x, other._topLeft.x) < Math.min(this._bottomRight.x, other._bottomRight.x))
        && (Math.max(this._topLeft.y, other._topLeft.y) < Math.min(this._bottomRight.y, other._bottomRight.y));
  }
}
