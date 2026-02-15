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
            

                