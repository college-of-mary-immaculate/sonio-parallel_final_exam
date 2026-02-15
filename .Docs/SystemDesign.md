[Dependency injection for modules]
File:
- container.js as the main dependency injection
- uses the index of each modules

inlcudes:
- Controllers
- Repositories
- Services
- Routes

[Module based design]
- Cleaner and easier set up
- Organized by feature


[Database table file base creation]
- Table schemes fully ORM 
- Seeds for tables (optional)

[Bootstrap helper]
- Contains the container instance
- Sets the api endpoints ('api/users')

[Server]
- Provide the port of the server
- Starts the server 

----------------------------------------------------------------------------------

Backend Structure 

server/
    src/
        backend/
            modules/
                voteModule/
                    voteController.js
                    voteRepository.js
                    voteService.js
                    voteRoutes.js
                    voteIndex.js
            di/
                container.js

            utils/
                jwt.js
                
            middlewares/
                authMiddleware.js

            bootstrap.js
            server.js
        
        database/
            models/
                voteModel.js
                candidateModel.js
                modelIndex.js (di inject to init.js)
            seeds/
                voteSeed.js
                candidateSeed.js
                seedIndex.js (di inject to init.js)

            db.js (db configuration using the env file)
            init.js (initializes the database, model, seeds using the indexes)
            

                