type FetchError = Error & {
  info?: string;
  status?: number;
};
