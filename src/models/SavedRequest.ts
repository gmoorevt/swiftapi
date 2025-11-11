/**
 * SavedRequest Model
 *
 * Represents a saved API request configuration within a collection
 * Preserves all request details including {{variable}} syntax
 */

import { generateUUID } from '../lib/uuid';
import { Request } from './Request';
import { HttpMethod, BodyType, type Header } from '../types/request.types';

export interface SavedRequestData {
  id: string;
  name: string;
  collectionId: string;
  order: number;
  url: string;
  method: HttpMethod;
  headers: Header[];
  body: string;
  bodyType: BodyType;
  timeout: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedRequestUpdateOptions {
  name?: string;
  url?: string;
  method?: HttpMethod;
  headers?: Header[];
  body?: string;
  bodyType?: BodyType;
  timeout?: number;
  order?: number;
}

export class SavedRequest {
  readonly id: string;
  readonly name: string;
  readonly collectionId: string;
  readonly order: number;
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: Header[];
  readonly body: string;
  readonly bodyType: BodyType;
  readonly timeout: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    id: string,
    name: string,
    collectionId: string,
    order: number,
    url: string,
    method: HttpMethod,
    headers: Header[],
    body: string,
    bodyType: BodyType,
    timeout: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.collectionId = collectionId;
    this.order = order;
    this.url = url;
    this.method = method;
    this.headers = headers;
    this.body = body;
    this.bodyType = bodyType;
    this.timeout = timeout;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Create SavedRequest from a Request object
   * Captures current state including {{variable}} syntax
   * @param request - The Request object to save
   * @param collectionId - ID of the collection to save to
   * @param name - Name for the saved request
   * @param rawUrl - The original URL string (may contain {{variables}})
   * @param order - Position in the collection (default 0)
   */
  static fromRequest(
    request: Request,
    collectionId: string,
    name: string,
    rawUrl: string,
    order: number = 0
  ): SavedRequest {
    const now = new Date();
    const saved = new SavedRequest(
      generateUUID(),
      name,
      collectionId,
      order,
      rawUrl, // Store the raw URL with variables preserved
      request.method,
      request.headers,
      request.body,
      request.bodyType,
      request.timeout,
      now,
      now
    );
    saved.validate();
    return saved;
  }

  /**
   * Convert SavedRequest back to Request object
   */
  toRequest(): Request {
    return new Request({
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
      bodyType: this.bodyType,
      timeout: this.timeout,
    });
  }

  /**
   * Update saved request properties (returns new instance)
   */
  update(changes: SavedRequestUpdateOptions): SavedRequest {
    const updated = new SavedRequest(
      this.id,
      changes.name ?? this.name,
      this.collectionId,
      changes.order ?? this.order,
      changes.url ?? this.url,
      changes.method ?? this.method,
      changes.headers ?? this.headers,
      changes.body ?? this.body,
      changes.bodyType ?? this.bodyType,
      changes.timeout ?? this.timeout,
      this.createdAt,
      new Date()
    );
    updated.validate();
    return updated;
  }

  /**
   * Validate saved request properties
   */
  private validate(): void {
    // Validate name
    const trimmedName = this.name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Request name cannot be empty');
    }

    if (this.name.length > 200) {
      throw new Error('Request name must be 200 characters or less');
    }

    // Validate collection ID
    if (this.collectionId.trim().length === 0) {
      throw new Error('Collection ID cannot be empty');
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): SavedRequestData {
    return {
      id: this.id,
      name: this.name,
      collectionId: this.collectionId,
      order: this.order,
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
      bodyType: this.bodyType,
      timeout: this.timeout,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Create SavedRequest from JSON data
   */
  static fromJSON(data: SavedRequestData): SavedRequest {
    return new SavedRequest(
      data.id,
      data.name,
      data.collectionId,
      data.order,
      data.url,
      data.method,
      data.headers,
      data.body,
      data.bodyType,
      data.timeout,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}
