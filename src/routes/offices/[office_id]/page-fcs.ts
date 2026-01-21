import { replace } from "svelte-spa-router";

export function replaceUrl(param: "transmittal" | "item") {
  const url = new URL(window.location.href);
  const hash = url.hash; // e.g., "#/offices/1?transmittal=21&item=107"

  // Split hash into path and query
  const [pathPart, queryPart] = hash.slice(1).split("?"); // remove #
  const pathSegments = pathPart.split("/"); // ['', 'offices', '1']
  const officeId = pathSegments[2]; // "1"

  const searchParams = new URLSearchParams(queryPart);

  let newUrl = `/offices/${officeId}`;

  if (param === "item") {
    const transmittalId = searchParams.get("transmittal");
    if (transmittalId) {
      newUrl += `?transmittal=${transmittalId}`;
    }
  }

  replace(newUrl);
}


export function getPageParams() {
  const params = new URLSearchParams(location.hash.split("?")[1]);

  const transmittal_pk = params.get("transmittal");
  const item_pk = params.get("item"); // "107"

  const path2 = location.hash.slice(1).split("?")[0]
  return { office_pk: path2.split("/")[2] ?? null, transmittal_pk, item_pk }
}