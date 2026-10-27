import { createHttpApi, type HttpApi } from "./api";
import { LOCAL_API_URL, type NetworkId } from "./networks";

export function localApi(): HttpApi {
  return createHttpApi({ baseUrl: LOCAL_API_URL, timeoutMs: 120_000 });
}

/** Browser side client. Local chains are only reachable from the user's own machine */
export function browserApi(network: NetworkId): HttpApi {
  if (network === "local") return localApi();
  const configured = process.env.NEXT_PUBLIC_PREFLIGHT_API_URL?.trim();
  return createHttpApi({ baseUrl: configured || window.location.origin });
}
