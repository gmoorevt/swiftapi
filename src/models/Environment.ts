import { randomUUID } from 'crypto';

/**
 * Environment model representing a set of variables for API testing
 * Follows immutable pattern - all modifications return new instances
 */
export class Environment {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly variables: Record<string, string>,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {
    this.validate();
  }

  /**
   * Create a new Environment with generated ID and timestamps
   * @param name - Display name (1-100 chars, alphanumeric + space/hyphen/underscore)
   * @param variables - Variable definitions (optional)
   * @returns New Environment instance
   */
  static create(name: string, variables: Record<string, string> = {}): Environment {
    const now = new Date().toISOString();
    return new Environment(
      randomUUID(),
      name,
      variables,
      now,
      now
    );
  }

  /**
   * Update environment properties (immutable - returns new instance)
   * @param changes - Partial updates to name and/or variables
   * @returns New Environment instance with updates
   */
  update(changes: Partial<Pick<Environment, 'name' | 'variables'>>): Environment {
    return new Environment(
      this.id,
      changes.name ?? this.name,
      changes.variables ?? this.variables,
      this.createdAt,
      new Date().toISOString()
    );
  }

  /**
   * Get variable value by key
   * @param key - Variable name
   * @returns Variable value or undefined if not found
   */
  getVariable(key: string): string | undefined {
    return this.variables[key];
  }

  /**
   * Set variable value (immutable - returns new Environment)
   * @param key - Variable name
   * @param value - Variable value
   * @returns New Environment instance with variable set
   */
  setVariable(key: string, value: string): Environment {
    return this.update({
      variables: { ...this.variables, [key]: value }
    });
  }

  /**
   * Delete variable (immutable - returns new Environment)
   * @param key - Variable name to delete
   * @returns New Environment instance without the variable
   */
  deleteVariable(key: string): Environment {
    const { [key]: _, ...rest } = this.variables;
    return this.update({ variables: rest });
  }

  /**
   * Validate environment data
   * @throws Error if validation fails
   */
  private validate(): void {
    // Name validation
    if (!this.name || this.name.length === 0 || this.name.length > 100) {
      throw new Error('Environment name must be 1-100 characters');
    }

    const namePattern = /^[a-zA-Z0-9\s_-]+$/;
    if (!namePattern.test(this.name)) {
      throw new Error('Environment name contains invalid characters');
    }

    // Variable name validation
    const varPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    for (const key of Object.keys(this.variables)) {
      if (!varPattern.test(key)) {
        throw new Error(`Invalid variable name: ${key}`);
      }
    }
  }
}
