# Gestão da Quinta da Alameda

Webapp de gestão da quinta (stock, vendas, vinha, adega, azeite, matéria seca, enológicos, tesouraria, enoturismo, custos).
Os dados ficam no Firebase (projeto `quinta-alameda`) e estão protegidos pelas regras em `firestore.rules`.
Este repositório não contém dados da quinta.

- `index.html` — a gestão
- `importar.html` — importação inicial dos dados (só administradores)
- `shim.js` — ligação ao Firebase (entrada, papéis, base de dados)
- `firebase-config.js` — configuração pública do projeto Firebase
- `firestore.rules` — regras de segurança a colar em Firestore → Regras
