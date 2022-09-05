//Helper to manage HTTP requets

type Toptions = {
    signal?: AbortSignal;
    method?: string;
    headers?: {};
    body?: string | false | {};
  };
  
  export const helpHttp = () => {
    const customFetch = async (endpoint: string, options: Toptions | any) => {
      // Here is possible add an additional header
      const defaultHeaders = {
        accept: "application/json",
      };
  
      // Object to abort the request if the service fail
      const controller = new AbortController();
  
      // with this we have an error handler in case the endpoint does not respond, using its property signal
      options.signal = controller.signal;
  
      // if information doesn't come,asign GET by default
      options.method = options.method || "GET";
  
      // Verify if the header brings information, If so, It merges default headers with the header brings by the user
      options.headers = options.headers
        ? { ...defaultHeaders, ...options.headers }
        : defaultHeaders;
  
      options.body = JSON.stringify(options.body) || false;
      //We check if option body is false, if so, then it deletes the propoerty body
      if (!options.body) {
        delete options.body;
      }
  
      //If after 3 sercons, an error was received in the connection to the backend, abort the connection
      setTimeout(() => {
        controller.abort();
      }, 5000);
  
      try {
        const res = await fetch(endpoint, options);
        return await
          // check if OK property comes, if it does not, so reject the promise
          (
            res.ok
              ? res.json()
              : Promise.reject({
                // Object to manage the error, which contains the information about the promise error
                err: true,
                status: res.status || "It doesn't bring any error",
                statusText: res.statusText || "An error occur",
              }));
      } catch (err) {
        return err;
      }
    };
  
    // If the user doesn't send options, so "options" = empty Object
    const get = (url: string, options: Toptions = {}) => {
      return customFetch(url, options);
    };
  
    const post = (url: string, options: Toptions = {}) => {
      options.method = "POST";
      return customFetch(url, options);
    };
  
    const put = (url: string, options: Toptions = {}) => {
      options.method = "PUT";
      return customFetch(url, options);
    };
  
    const del = (url: string, options: Toptions = {}) => {
      options.method = "DELETE";
      return customFetch(url, options);
    };
  
    //  It returns an Object
    return {
      get,
      post,
      put,
      del,
    };
  };
  