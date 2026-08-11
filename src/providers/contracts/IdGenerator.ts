export interface IdGenerator {
  /**
   * Generates a new unique identifier as a string.
   */
  generate(): string;
}
