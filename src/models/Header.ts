/**
 * Header Model
 *
 * Represents an HTTP header (request or response).
 *
 * @see specs/001-basic-request-builder/data-model.md
 */

import type { Header as HeaderType } from '../types/request.types';

export class Header implements HeaderType {
  readonly name: string;
  readonly value: string;
  readonly enabled: boolean;

  constructor(name: string, value: string, enabled: boolean = true) {
    this.name = name;
    this.value = value;
    this.enabled = enabled;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): HeaderType {
    return {
      name: this.name,
      value: this.value,
      enabled: this.enabled,
    };
  }

  /**
   * Create from plain object
   */
  static fromJSON(json: HeaderType): Header {
    return new Header(json.name, json.value, json.enabled);
  }
}
