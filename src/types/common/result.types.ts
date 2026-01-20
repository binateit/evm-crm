// Property Failure Result
export interface PropertyFailureResult {
  propertyName: string;
  errorMessage: string;
}

export interface Result<T = unknown> {
  succeeded: boolean;
  messages: string[];
  data: T;
  source: string;
  exception: string;
  errorCode: number;
  supportMessage: string | null;
  statusCode: number;
  propertyResults: PropertyFailureResult[];
}

// Common Result Types
export type BooleanResult = Result<boolean>;
export type StringResult = Result<string>;
