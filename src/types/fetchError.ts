type FetchError = Error & {
  info?: string;
  status?: number;
  originalError?: any;
  originalErrorMessage?: string;
  isKnown: boolean;
};
