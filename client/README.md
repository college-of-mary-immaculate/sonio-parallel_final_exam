Client side will be created with
* Organized files
* Clean routing
* Layouts
* Global styling with page level styles for pages own css.
* Context providing
* Routes sturcture
* Protected routes 
* Api and services to communicate to the load balancer.

Client side calls to the load balancer, load balancer manage which backend will handle that request.
Load balancer is nginx so by default is round robin.

Styles architecture:
1. Top level (Global.css)
    - fonts
    - structure
    - etc.

2. Role based theme (UserGlobal.css, AdminGlobal.css)
    - color theme
    - styling
    - components color

3. Layout level (Mainlayout etc.)
    - structure 
    - place holder for pages and component props
    
4. Page level (HomePage.jsx etc.)
    - structure
    - use of components
    - etc.

