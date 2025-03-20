export const getAPIRoute = (path: string) => {
  const apiBaseURL = import.meta.env.VITE_HTTP_API_HOST;

  return `${apiBaseURL}${path}`;
};

export const handleResult = async (res: Response) => {
  if (res.status == 200) {
    return await res.json();
  } else if (res.status >= 400) {
    const result = await res.text();
    console.error("BadRequest", result);
  } else if (res.status >= 500) {
    console.error("InternalServerError");
  } else {
    console.log("unknown error");
  }
  throw new Error(res.statusText);
};
