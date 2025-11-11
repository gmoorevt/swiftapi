/**
 * Variable Resolution Engine for SwiftAPI
 *
 * Resolves {{variable}} template syntax with values from environment variables.
 * Supports nested resolution up to 10 levels deep with circular reference detection.
 *
 * Constitutional requirement: <50ms for 100+ variables (FR-013)
 */

/**
 * Custom error class for variable resolution failures
 */
export class VariableResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VariableResolutionError';
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VariableResolutionError);
    }
  }
}

/**
 * Regex pattern to match {{variableName}} syntax
 * Pattern: {{identifier}} where identifier = [a-zA-Z_][a-zA-Z0-9_]*
 */
const VARIABLE_PATTERN = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

/**
 * Maximum nesting depth for variable resolution
 * Prevents infinite loops and stack overflow attacks
 */
const MAX_DEPTH = 10;

/**
 * Resolves all {{variable}} references in text with values from variables map.
 * Supports nested resolution (variables can reference other variables).
 *
 * @param text - Text containing {{variable}} placeholders
 * @param variables - Map of variable names to values
 * @returns Fully resolved text with all variables substituted
 * @throws {VariableResolutionError} If variable is undefined, circular reference detected, or max depth exceeded
 *
 * @example
 * ```typescript
 * const variables = {
 *   baseUrl: 'https://{{domain}}.com',
 *   domain: 'api.dev'
 * };
 * resolveVariables('{{baseUrl}}/users', variables);
 * // Returns: 'https://api.dev.com/users'
 * ```
 */
export function resolveVariables(
  text: string,
  variables: Record<string, string>
): string {
  let resolved = text;
  let depth = 0;
  const resolutionHistory: string[][] = []; // Track resolution path per iteration

  // Continue resolving until no more {{}} patterns found or max depth reached
  while (VARIABLE_PATTERN.test(resolved)) {
    // Check depth limit before processing
    if (depth >= MAX_DEPTH) {
      throw new VariableResolutionError(
        `Maximum nesting depth (${MAX_DEPTH}) exceeded`
      );
    }

    // Reset regex state (global regex maintains lastIndex)
    VARIABLE_PATTERN.lastIndex = 0;

    const currentIterationVars: string[] = [];
    let hasChanges = false;

    // Replace ALL variables in current iteration
    resolved = resolved.replace(VARIABLE_PATTERN, (_match: string, varName: string) => {
      // Check if variable exists
      if (!(varName in variables)) {
        throw new VariableResolutionError(
          `Variable {{${varName}}} is not defined in current environment`
        );
      }

      // Check for circular reference by looking at resolution history
      for (const historicalVars of resolutionHistory) {
        if (historicalVars.includes(varName)) {
          // Found a circular reference - build the path
          const allVars = [...resolutionHistory.flat(), varName];
          const cyclePath = allVars.join(' → ');
          throw new VariableResolutionError(`Circular reference detected: ${cyclePath}`);
        }
      }

      currentIterationVars.push(varName);
      hasChanges = true;
      return variables[varName]!;
    });

    if (!hasChanges) {
break;
}

    resolutionHistory.push(currentIterationVars);
    depth++;

    // Reset regex state for next iteration
    VARIABLE_PATTERN.lastIndex = 0;
  }

  return resolved;
}

/**
 * Extracts all variable names from text containing {{variable}} patterns.
 *
 * @param text - Text to extract variable names from
 * @returns Array of variable names (may contain duplicates if variable appears multiple times)
 *
 * @example
 * ```typescript
 * extractVariables('{{baseUrl}}/users/{{userId}}');
 * // Returns: ['baseUrl', 'userId']
 * ```
 */
export function extractVariables(text: string): string[] {
  const matches = text.matchAll(VARIABLE_PATTERN);
  return Array.from(matches, m => m[1]).filter((v): v is string => v !== undefined);
}

/**
 * Checks if text contains any {{variable}} patterns.
 *
 * @param text - Text to check
 * @returns true if text contains at least one variable, false otherwise
 *
 * @example
 * ```typescript
 * hasVariables('{{baseUrl}}/users'); // true
 * hasVariables('https://api.example.com'); // false
 * ```
 */
export function hasVariables(text: string): boolean {
  VARIABLE_PATTERN.lastIndex = 0; // Reset regex state
  const result = VARIABLE_PATTERN.test(text);
  VARIABLE_PATTERN.lastIndex = 0; // Reset again for next call
  return result;
}
