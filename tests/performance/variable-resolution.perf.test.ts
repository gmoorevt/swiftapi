/**
 * Variable Resolution Performance Tests (T272)
 *
 * Constitutional requirement: <50ms for 100+ variables (FR-013)
 *
 * Tests:
 * - 100 variables resolved in <50ms
 * - 1000 variables benchmark (measure actual performance)
 * - Nested variable resolution performance
 * - Large text with many variable substitutions
 */

import { describe, it, expect } from 'vitest';
import { resolveVariables } from '../../src/lib/variableResolver';

describe('Variable Resolution Performance (T272)', () => {
  describe('Constitutional Requirement: 100 variables <50ms', () => {
    it('should resolve 100 variables in less than 50ms', () => {
      // Create environment with 100 variables
      const variables: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        variables[`var${i}`] = `value${i}`;
      }

      // Create text with all 100 variables
      let text = '';
      for (let i = 0; i < 100; i++) {
        text += `{{var${i}}} `;
      }

      // Measure resolution time
      const startTime = performance.now();
      const result = resolveVariables(text, variables);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Constitutional requirement: <50ms
      expect(duration).toBeLessThan(50);

      // Verify all variables were resolved
      for (let i = 0; i < 100; i++) {
        expect(result).toContain(`value${i}`);
      }
    });

    it('should resolve 100 unique variables across multiple strings in <50ms', () => {
      const variables: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        variables[`var${i}`] = `value${i}`;
      }

      // Add variables for API endpoint-style strings
      variables['baseUrl'] = 'https://api.example.com';
      variables['userId'] = '123';
      variables['postId'] = '456';
      variables['apiHost'] = 'api.test.com';
      variables['apiVersion'] = '2';
      variables['endpoint'] = 'data';
      variables['protocol'] = 'https';
      variables['domain'] = 'example.com';
      variables['path'] = 'api/v1';
      variables['apiKey'] = 'abc123';

      // Multiple API endpoint-style strings using different variables
      const urls = [
        '{{baseUrl}}/users/{{userId}}/posts/{{postId}}',
        '{{apiHost}}/v{{apiVersion}}/{{endpoint}}',
        '{{protocol}}://{{domain}}/{{path}}?key={{apiKey}}',
      ];

      // Add more variable references to reach 100
      for (let i = 10; i < 100; i++) {
        urls.push(`{{var${i}}}`);
      }

      const startTime = performance.now();

      for (const url of urls) {
        resolveVariables(url, variables);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('1000 Variable Benchmark', () => {
    it('should benchmark 1000 variables and report timing', () => {
      // Create environment with 1000 variables
      const variables: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        variables[`var${i}`] = `value${i}`;
      }

      // Create text with all 1000 variables
      let text = '';
      for (let i = 0; i < 1000; i++) {
        text += `{{var${i}}} `;
      }

      const startTime = performance.now();
      const result = resolveVariables(text, variables);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log for benchmark purposes
      console.log(`[BENCHMARK] 1000 variables resolved in ${duration.toFixed(2)}ms`);

      // Should still be reasonably fast (under 500ms)
      expect(duration).toBeLessThan(500);

      // Verify correctness
      for (let i = 0; i < 1000; i++) {
        expect(result).toContain(`value${i}`);
      }
    });

    it('should efficiently handle repeated variable resolution', () => {
      const variables = {
        baseUrl: 'https://api.example.com',
        version: 'v1',
        endpoint: 'users',
      };

      const url = '{{baseUrl}}/{{version}}/{{endpoint}}';
      const iterations = 1000;

      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        resolveVariables(url, variables);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / iterations;

      console.log(`[BENCHMARK] Average resolution time: ${averageTime.toFixed(3)}ms`);

      // Each resolution should be very fast (<1ms average)
      expect(averageTime).toBeLessThan(1);
    });
  });

  describe('Nested Variable Resolution Performance', () => {
    it('should resolve nested variables efficiently', () => {
      const variables = {
        domain: 'example.com',
        subdomain: 'api.{{domain}}',
        protocol: 'https',
        baseUrl: '{{protocol}}://{{subdomain}}',
        version: 'v1',
        fullUrl: '{{baseUrl}}/{{version}}',
      };

      const text = '{{fullUrl}}/users';

      const startTime = performance.now();
      const result = resolveVariables(text, variables);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should be very fast even with 4 levels of nesting
      expect(duration).toBeLessThan(10);
      expect(result).toBe('https://api.example.com/v1/users');
    });

    it('should handle complex nested variable chains', () => {
      // Create a chain of 10 nested variables
      const variables: Record<string, string> = {
        var0: 'final_value',
      };

      for (let i = 1; i < 10; i++) {
        variables[`var${i}`] = `{{var${i - 1}}}`;
      }

      const startTime = performance.now();
      const result = resolveVariables('{{var9}}', variables);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
      expect(result).toBe('final_value');
    });
  });

  describe('Large Text with Variable Substitution', () => {
    it('should handle large request bodies with variables', () => {
      const variables = {
        userId: '12345',
        userName: 'testuser',
        email: 'test@example.com',
        apiKey: 'abc123',
      };

      // Create a large JSON body with variables
      let jsonBody = '{\n';
      for (let i = 0; i < 1000; i++) {
        jsonBody += `  "field${i}": "{{userId}}_{{userName}}_{{email}}",\n`;
      }
      jsonBody += '  "apiKey": "{{apiKey}}"\n}';

      const startTime = performance.now();
      const result = resolveVariables(jsonBody, variables);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[BENCHMARK] Large body (3000 variables) resolved in ${duration.toFixed(2)}ms`);

      // Should handle large bodies efficiently
      expect(duration).toBeLessThan(200);
      expect(result).toContain('12345_testuser_test@example.com');
    });

    it('should efficiently resolve variables in headers', () => {
      const variables = {
        token: 'bearer_token_12345',
        apiKey: 'key_67890',
        contentType: 'application/json',
        userId: '123',
      };

      // Simulate resolving multiple headers
      const headers = [
        'Authorization: Bearer {{token}}',
        'X-API-Key: {{apiKey}}',
        'Content-Type: {{contentType}}',
        'X-User-ID: {{userId}}',
      ];

      const startTime = performance.now();

      const resolvedHeaders = headers.map(header =>
        resolveVariables(header, variables)
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should be nearly instant for headers
      expect(duration).toBeLessThan(5);
      expect(resolvedHeaders[0]).toBe('Authorization: Bearer bearer_token_12345');
    });
  });

  describe('Edge Cases Performance', () => {
    it('should handle text with no variables quickly', () => {
      const variables = { test: 'value' };
      const text = 'https://api.example.com/users/123';

      const startTime = performance.now();
      const result = resolveVariables(text, variables);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // No-op should be extremely fast (<1ms)
      expect(duration).toBeLessThan(1);
      expect(result).toBe(text);
    });

    it('should efficiently handle many duplicate variables', () => {
      const variables = { baseUrl: 'https://api.example.com' };

      // Create text with same variable 100 times
      const text = Array(100).fill('{{baseUrl}}').join(' / ');

      const startTime = performance.now();
      const result = resolveVariables(text, variables);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(20);
      expect(result.split('https://api.example.com').length - 1).toBe(100);
    });
  });
});
