Voting system project plan

voters:
- signup create account 
- Otp receive to create verify
- login
- vote in the election 

Admin side:
Managements:

Election management:
- create election
- start election
- end election

Position management:
* Details:
    - candidate count
    - winner/s count 
    - votes per voter

- add position (president, vice president etc.)
- remove position
- update positon
- view position

Candidates management: 
- add candidates
- edit candidates
- remove candidates

--------------------------------------------

Admin

global lists: (Source of truth to use )
- candidates 
- positions

create election:
- title : ex. "National Election 2026"
- start date:
- end date:

after creation of election:
- election have empty list of positoons and candidates
- admin will select candidates that will be participating in this election from the global list of candidates 
- so admin should list all the candidates in the global list of candidates so can select in this election
- the list of candidates in this election can be updated. can be remove other and add. as long as the election has'nt been started yet

now after including the candidates:
- we can create the positions include in the election. we select postions in the global position list! (the source of truth)
- again, can add more position and remove anytime. as long as the election not started yet

real time vote ranking:
- per each position 
- realtime so the user can view it moving the vote number as the voters vote

---------------------------------------------------------------------------

Stages for the voters:

create account to be a voter
- signup (email, fullname, password, verifypassword 
- before making this singup successful, the otp will send a code first then the user will need to put it in the modal pop up, if match. signup successful. if not then invalid. can try again
- voter wait for the active election. if not then no active election yet. but if there is vote the is already been created and just the start date is not yet. the user can view the count down of that election. once the countdown ends. the voter can now enter the election then vote.


-----------------------------------------------------------------------------

realtime events:
- countdown of the election before starting. (so the users can view when it will start) once start. voter can enter now in the election and start voting
- vote ranking (for admin viewing only unless admin allows it to be displayed (has option))