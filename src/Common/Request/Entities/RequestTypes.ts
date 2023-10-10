import { Request } from "express"

export type RequestWithBody<T> = Request<{}, {}, T, {}>;
export type RequestWithParams<T> = Request<T, {}, {}, {}>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type CompleteRequest<Params, Body, Query> = RequestWithParams<Params> & RequestWithBody<Body> & RequestWithQuery<Query>;