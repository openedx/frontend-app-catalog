export interface UseEnrollmentParamsTypes {
  onError: (msg: string) => void;
  errorMessage: string;
}

export type EnrollmentFunctionTypes = (courseId: string, redirectUrl: string) => Promise<void>;

export interface HttpError {
  customAttributes?: {
    httpErrorStatus?: number;
  };
}
