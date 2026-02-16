candidateModule business logic

Responsibilities:
- global candidate registry
- candidate profiles

Business rules:
- candidates are reusable across elections
- candidate removal rules:
    * cannot delete if used in ended elections
    * can delete if unused yet
- candidate date updates:
    * affect future elections only. not the old elections involve