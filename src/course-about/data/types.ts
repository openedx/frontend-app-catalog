export interface UseEnrollmentParamsTypes {
  onError: (msg: string) => void;
  errorMessage: string;
}

export interface EnrollmentFunctionTypes {
  (courseId: string, redirectUrl: string): Promise<void>;
}

export interface HttpError {
  customAttributes?: {
    httpErrorStatus?: number;
  };
}
