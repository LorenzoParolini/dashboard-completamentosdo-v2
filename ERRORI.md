
da frontend:

| Risorsa  | GET | POST      | PUT               | DELETE            |
| -------- | --- | --------- | ----------------- | ----------------- |
| regioni  | OK  | OK        | OK (ri-GETTARE)   | OK ma [1]         |
| clienti  | OK  | OK ma [2] | 403 Forbidden [3] | 403 Forbidden [4] |
| software | OK  | OK        | 403 Forbidden [5] | 403 Forbidden     |
| ambienti | OK  | OK        | 403 Forbidden     | 403 Forbidden     |
note problemi:
1. non elimina le regioni aggiunte da frontend
2. non aggiunge i campi (rimangono vuoti) + c'è bisogno di refresh page
3. e non si vedono neanche i campi quando sia apre la modale
4. e modale buggata
5. e non si vedono neanche i campi quando sia apre la modale


da postman:

| Risorsa  | GET         | POST | PUT | DELETE |
| -------- | ----------- | ---- | --- | ------ |
| regioni  | OK(non DTO) | OK   | OK  | OK     |
| clienti  | OK          | OK   | OK  | OK     |
| software | OK          | OK   | OK  | OK     |
| ambienti | OK          | OK   | OK  | OK     |
altri problemi:
- get di regioni e non di regioniDTO