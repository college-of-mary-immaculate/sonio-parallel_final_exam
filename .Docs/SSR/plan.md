Have ssr implementation in client side.

Current problem:
- CSR (client side rendering) is too slow when throttle is set to slow 3g
- Slow downloading needed , hydrating the pages, loading the js files etc.

Solution SSR:
- SSR implementation in client side via having to separate the api server calls in jsx pages 
so i come up with the solution of having two files for ssr. so we remove the api server call in use effect
since use effect in jsx cannot be activate by the ssr. we need to separate it

ssr-serverApi.js 
    * contains the server api calls that the jsx pages uses in use effect.
    * will be having the data needed to hydrate the jsx files

ssr-serverPages.js
    * contains the rendered html page
    * will be hacing the structure to accept the data from ssr serverapi.js

Final:
    * combine the output of ssr-serverApi.js and ssr-serverPages.js
    * rendered html and data fetched combined = hydrated page 
    * faster than csr

    