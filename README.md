# Batalha Naval

## Especificação

O tabuleiro tem 10 linhas e 10 colunas. A frota contém um porta-aviões de 5 casas, um encouraçado de 4, um submarino de 3 e um destroier de 2. Cada navio ocupa casas consecutivas na horizontal ou na vertical. Navios podem se tocar, inclusive pelas laterais. Uma casa pode pertencer a apenas um navio. A vitória ocorre ao acertar as 14 casas da frota.

## Contrato para a implementação

Em `src/jogo.js`, exporte as funções síncronas abaixo. Cada posição é um par `[linha, coluna]` com índices inteiros de `0` a `9`.

- `criarTabuleiro(frota)` recebe quatro objetos `{ tipo, casas }`. Os tipos são `porta_avioes`, `encouracado`, `submarino` e `destroier`. `casas` contém as posições ocupadas. Retorne `{ largura: 10, altura: 10, frota, tiros: [] }`, preservando a ordem da frota e de suas casas.
- `atirar(estado, posicao)` devolve `{ estado, resultado }`. Adicione cada posição nova em `estado.tiros` na ordem dos tiros. Use `agua` em casa vazia, `acerto` se o navio ainda tem casas intactas, `afundou` ao atingir a última casa de um navio quando sobra frota, e `vitoria` ao afundar o último navio. Em uma posição já atingida, use `repetido` e preserve a lista de tiros.
- Lance `RangeError` para frota inválida ou tiro fora do tabuleiro.

## Casos de teste

- **BN01** aceita a frota completa com navios horizontais, verticais e encostados.
- **BN02** rejeita frota incompleta, tipo repetido e comprimento errado.
- **BN03** rejeita navio diagonal, com lacuna, sobreposto ou fora do tabuleiro.
- **BN04–BN05** verificam tiros na água, acertos e coordenadas inválidas.
- **BN06** confirma que repetir um tiro não duplica o acerto. Acertar a segunda casa afunda o destroier.
- **BN07** confirma que o 14º acerto distinto é o que encerra a partida com vitória.

## Execução

Com Node.js 24, rode `npm test` na raiz. A entrega registra a etapa **Red** do TDD. Sem `src/jogo.js`, a suíte retorna código 1 com `ERR_MODULE_NOT_FOUND`. Crie esse módulo com o contrato acima e repita `npm test` para executar as asserções.

## Colaborador

Rafael Blasques Morales ([Rafaelmorales14](https://github.com/Rafaelmorales14)).
