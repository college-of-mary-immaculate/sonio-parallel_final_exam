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

        prisma/
            schema.prisma
        
        database/
            seeds/
                voteSeed.js (seeding the tables)
                candidateSeed.js
                seedIndex.js (di inject to init.js)

            db.js (db configuration using the env file)
            init.js (initializes the database, model, seeds using the indexes) (if database exist, skip. if not create the database then 
            init the tables first before seeding. arrange preperly)
    .env (sensitive datas for config)

Backend Design
- Modulized feature base
- SRP
- Dependency injection
- Singleton instance for shared 

                