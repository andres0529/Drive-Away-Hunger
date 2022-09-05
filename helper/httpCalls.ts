export async function callhttpCalls(APIURL: string) {
  const headers = new Headers();

  const options = {
    method: "GET",
    headers: headers,
  };

  return await fetch(APIURL, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}
