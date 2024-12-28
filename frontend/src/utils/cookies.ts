import Cookies from "js-cookie";

import { COOKIES_TOKEN_KEY } from "./constants";

export const get_token = () => {
  return Cookies.get(COOKIES_TOKEN_KEY);
}

export const put_token = (token: string) => {
  Cookies.set(
    COOKIES_TOKEN_KEY, 
    token, 
    { 
      expires: 7, 
      secure: true, 
      sameSite: 'Strict' 
    });
}

export const remove_token = () => {
  Cookies.remove(COOKIES_TOKEN_KEY);
}
