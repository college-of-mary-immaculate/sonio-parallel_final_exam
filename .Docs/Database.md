Users table
- id
- username
- password
- role
- has_voted (to identify if this user already vote)
- created at

Notes:
- for voters

Position / Candidate type
- position id
- position name
- description
- max votes

Notes:
- max vote is for the voters, onle 1 vote for voters to vote this selected candidate

Candidates table
- canidate id
- fullname
- position id (fk position)
- photo url (for displaying)
- description

Notes:
- for candidates

Votes
- vote id (pk)
- user id (fk - users)
- candidate id (fk - canidate)
- position id (fk - position)
- voted at

Notes:
- prevents double voting
- allow counting votes
- enables ranking
