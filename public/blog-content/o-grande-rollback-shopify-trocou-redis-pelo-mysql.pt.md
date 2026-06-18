# O Grande Rollback? A Shopify trocou o Redis pelo MySQL

Caso interessantíssimo trazido pelo canal do [Mano Deyvin](https://www.youtube.com/watch?v=iiHvAo61H-w) onde ele conta o caso da Shopify – a gigante do e-commerce que segurou incríveis $5,1 milhões de dólares por minuto de vendas na Black Friday de 2025 – jogou o Redis fora e resolveu seu maior gargalo de escalabilidade usando apenas o bom e velho MySQL. [Você pode ler o post técnico original da Shopify aqui](https://shopify.engineering/scaling-inventory-reservations).

O problema que eles precisavam resolver era clássico: o pesadelo de duas pessoas clicarem em "finalizar compra" para o último tênis do estoque exatamente ao mesmo tempo. Para evitar que os dois pagassem pelo item (o que gera reembolso e cliente furioso) ou que o sistema bloqueasse a venda à toa, eles usam o que chamam de "proteção contra supervenda" (*oversell protection*).

Por anos, a arquitetura funcionava assim: o Redis operava como um "caixa rápido" guardando as reservas temporárias, enquanto o MySQL era o banco central com o estoque real. A treta é que atualizar o MySQL e limpar o Redis na hora do pagamento não era uma transação única. Basicamente, se a ordem das coisas saísse do trilho, a loja vendia sem dar baixa ou o estoque era deduzido, mas continuava preso como reservado no Redis. Era o caos de manter dois sistemas sincronizados.

Até que a equipe resolveu questionar o status quo e migrar tudo para dentro do MySQL. Como? Usando uma feature do MySQL 8 que existe desde 2018: o `SKIP LOCKED`.

A sacada de gênio foi mudar a modelagem: em vez de ter uma linha na tabela dizendo `quantidade = 10`, eles passaram a ter uma linha no banco para cada unidade física do produto. Se você compra 3 unidades, o banco seleciona e move três linhas na mesma transação. O `SKIP LOCKED` funciona como um estoquista super ágil: se ele vê que alguém já está segurando a caixa (linha bloqueada por outra transação), ele pula pra próxima caixa disponível na prateleira sem travar o sistema e sem fila. E para a tabela não ficar gigante e lenta na busca, eles limitaram tudo a um "pool" de no máximo 1.000 linhas por item, que vai sendo reabastecido automaticamente.

Mas aqui vem o plot twist!

Mesmo depois de otimizar tudo, criar chaves compostas e ajustar travas, a performance bateu num teto. A latência estava ok e o uso da CPU estava baixo, mas o sistema simplesmente não escalava porque as conexões com o banco estavam se esgotando.

Foi aí que rolou um trabalho de detetive. Os engenheiros começaram a colocar etiquetas (*tags*) em cada operação SQL no código para descobrir quem estava "monopolizando" o banco. O resultado? O problema nem eram as reservas! Partes antigas do fluxo de checkout estavam segurando conexões por tempo demais, igualzinho aquele vizinho sem noção que ocupa a vaga da garagem e some. As reservas foram apenas a "gota d'água" em um pool de conexões que já estava no limite.

A equipe limpou esse código de checkout (reduzindo em 33% as transações), ajustou uma configuração antiga de threads do MySQL e o sistema voou. Bateram todos os recordes da Black Friday de 2025 com o banco de dados principal usando menos de 50% da CPU.

A lição que fica, fortalecendo a tese do que a galera chama de "O Grande Rollback": antes de sair no automático tacando Redis, Kafka ou ferramentas complexas pra resolver concorrência, olhe bem para o seu banco relacional. Ele provavelmente dá conta do recado e, muitas vezes, o seu verdadeiro gargalo não é o banco, mas sim a "tubulação" no resto do seu código.
