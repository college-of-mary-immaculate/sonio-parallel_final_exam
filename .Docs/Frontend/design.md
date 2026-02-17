# Top level
Global.css (basic style that should exist in all)
* font
* size
* etc. 
* No color here.

Note:
- Override all underneath

# Second level
UserGlobal.css
* Color (blue formal professional) 
* Style
* etc. 

Note:
- For user ui! and pages of user has this css for consistency
- Some pages can still force it's own if needed.

# Second level
AdminGlobal.css
* Color (green formal professional)
* Style
* etc. 

Note:
- For admin ui and pages for consistency
- Some pages can force it's own if needed

# Layout level
MainLayout.css
* Structure 
* Placeholder for page
* Placeholder for accepted props (navbar, sidebar etc.)
* Has the style for navbar and sidebar (since it structure it with the layout)

Note:
- Basically structure the how pages, navbar (received props) structure together 
- like navbar should be at the top and below of it is the main screen for the page
- just decides where to put them together
- should have a design for if no received parameters and if has parametes (navbar etc.)

# Page level
Pages css
* Handle how itself structured. like button where it placed.
* If it has force css. or css that doesn't exist in global and it's scoped user/admin css
* Design it's own component so pages freely design it.

