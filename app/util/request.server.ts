import {json} from "@remix-run/node";

export let bad_request = <T>(data: T) => json<T>(data, {status: 400});
