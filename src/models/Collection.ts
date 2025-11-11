/**
 * Collection Model
 *
 * Represents a collection/folder for organizing saved API requests
 */

import { generateUUID } from '../lib/uuid';

export interface CollectionData {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionUpdateOptions {
  name?: string;
  order?: number;
}

export class Collection {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    id: string,
    name: string,
    order: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.order = order;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Create a new Collection with auto-generated id and timestamps
   */
  static create(name: string, order: number = 0): Collection {
    const now = new Date();
    const collection = new Collection(generateUUID(), name, order, now, now);
    collection.validate();
    return collection;
  }

  /**
   * Update collection properties (returns new instance)
   */
  update(changes: CollectionUpdateOptions): Collection {
    const updated = new Collection(
      this.id,
      changes.name ?? this.name,
      changes.order ?? this.order,
      this.createdAt,
      new Date()
    );
    updated.validate();
    return updated;
  }

  /**
   * Validate collection properties
   */
  private validate(): void {
    // Validate name
    const trimmedName = this.name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Collection name cannot be empty');
    }

    if (this.name.length > 100) {
      throw new Error('Collection name must be 100 characters or less');
    }

    // Only allow alphanumeric, spaces, hyphens, and underscores
    const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNamePattern.test(this.name)) {
      throw new Error(
        'Collection name can only contain letters, numbers, spaces, hyphens, and underscores'
      );
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): CollectionData {
    return {
      id: this.id,
      name: this.name,
      order: this.order,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Create Collection from JSON data
   */
  static fromJSON(data: CollectionData): Collection {
    return new Collection(
      data.id,
      data.name,
      data.order,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}
