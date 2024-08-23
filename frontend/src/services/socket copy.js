
import openSocket from "socket.io-client";
import { isObject } from "lodash";

export function socketConnection(params) {
  let userId = null;
  if (localStorage.getItem("userId")) {
    userId = localStorage.getItem("userId");
  }

  let token = null;

  if (localStorage.getItem("token")) {
    token = localStorage.getItem("token");
  }

  return openSocket(process.env.REACT_APP_BACKEND_URL, {
    transports: ["websocket", "polling", "flashsocket"],
    pingTimeout: 18000,
    pingInterval: 18000,
    query: isObject(params)
      ? { ...params, userId, token: JSON.parse(token) }
      : { userId, token: JSON.parse(token) },
  });
}