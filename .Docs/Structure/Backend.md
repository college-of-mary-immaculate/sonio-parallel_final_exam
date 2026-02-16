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
                etc.

            utils/
                jwt.js
                etc.

            sockets/
                wesocket.js
                etc.
                
            middlewares/
                authMiddleware.js
                etc.

            bootstrap.js
            server.js
        
        database/
            models/
                voteModel.js (table scheme only for creating tables)
                candidateModel.js
                modelIndex.js (di inject to init.js)
            seeds/
                voteSeed.js (seeding the tables)
                candidateSeed.js
                seedIndex.js (di inject to init.js)

            db.js (db configuration using the env file)
            init.js (initializes the database, model, seeds using the indexes) (if database exist, skip. if not create the database then 
            init the tables first before seeding. arrange properly)

    .env (for sensitive data)
            


Backend Design
- Modulized feature base
- SRP
- Dependency injection
- Singleton instance for shared 

                
Notes for later:
- This will be put in docker
- Must be docker ready
- Master slave replication ready (1 master, 2 slave) 
- Load balancing ready (3 port of server)
- build.sh (contains the docker fresh start and step by step creation. master slave connection process. initialize database etc.)