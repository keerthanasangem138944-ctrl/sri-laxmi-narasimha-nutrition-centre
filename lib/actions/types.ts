/**
 * Standard Server Action Response Structure
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
