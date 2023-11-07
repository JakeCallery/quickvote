export const getFetchErrorMessage = (error: any) => {
  if ("message" in error) return error.message;
  if ("toString" in error && typeof error.toString === "function")
    return error.toString();
  return "Unknown Error";
};

export const getFetchErrorStatus = (error: any) => {
  if ("status" in error) return error.status.toString();
  return "";
};

export const createClientSideUnknownError = (error: any, message: string) => {
  const fetchError = new Error(message) as FetchError;
  fetchError.message = message;
  fetchError.originalError = error;
  fetchError.originalErrorMessage = error.message;
  fetchError.info = "";
  fetchError.isKnown = false;
  return fetchError;
};

export const createClientSideFetchError = async (
  res: Response,
  errorMessage: string,
) => {
  const fetchError = new Error(errorMessage) as FetchError;
  const resData = await res.json();
  fetchError.info = resData;
  fetchError.status = res.status;
  fetchError.originalErrorMessage =
    resData && "error" in resData ? resData.error.toString() : "";
  fetchError.isKnown = true;
  return fetchError;
};
