import cookie from "js-cookie";
export const getJsonCookie = (name: any) => {
  if (typeof window !== "undefined") {
    const data = cookie.get(name);

    const parsedData = JSON.parse(data);
    return parsedData;
  }
  return null;
};

export const setJsonCookie = (name: string, value: any) => {
  if (typeof window !== "undefined") {
    cookie.set(name, JSON.stringify(value), { expires: 7 });
  }
};
