./Docs/assets/chart.png 
- Chart explaining the flow architecture
- 1 client, 1 load balancer, 3 backend server with websocket in docker
- redisadapter in docker
- 1 load balancer
- master slave replication (1 master 2 slave)

./Docs/assets/admin/
candidatemanagement.png 
- candidate management
    * add candidate
    * remove candidate
    * edit candidate
    * display 

- electionmanagement.png
    * add election
    * remove election
    * edit election
    * display

- positionmanagement.png
    * add position
    * remove position
    * edit position
    * display

- livetracking.png, livetracking2.png,livetracking3.png 
    * The real time monitoring of vote rankings

./Docs/assets/voter/
- electionuser.png 
    * selection of election
    * views pending and active election 
    * have vote now to go in voting page

- vote.png, vote2.png 
    * voting stage
    * voting candidate per positions
    * with validation and limit per votes and submit

./Docs/assets/docker.png
    * contains the view of docker 
    * containing all (client,server, masterslave, load balancer,redisadapter)