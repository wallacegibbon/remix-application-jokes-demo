import {json} from "@remix-run/node";

export let bad_request = <T>(data: T) => {
  return json<T>(data, {status: 400});
};
