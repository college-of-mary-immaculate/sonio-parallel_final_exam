Voting System

3 server port instance
1 master , 2 slave
real time (add later)


                (later)
            ┌──────────────┐
            │ Load Balancer │
            └──────┬───────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
 backend_1    backend_2    backend_3
      │            │            │
      └───────┬────┴────┬───────┘
              │           │
        mysql_master   mysql_slave1
                          mysql_slave2
