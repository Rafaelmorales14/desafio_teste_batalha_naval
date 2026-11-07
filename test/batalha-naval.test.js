import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarTabuleiro, atirar } from '../src/jogo.js';

const frota = [
    { tipo: 'porta_avioes', casas: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
    { tipo: 'encouracado', casas: [[1, 0], [2, 0], [3, 0], [4, 0]] },
    { tipo: 'submarino', casas: [[9, 7], [9, 8], [9, 9]] },
    { tipo: 'destroier', casas: [[7, 9], [8, 9]] },
];
const tabuleiro = () => criarTabuleiro(structuredClone(frota));
const comDestroier = casas => [...frota.slice(0, 3), { tipo: 'destroier', casas }];

test('BN01 aceita frota completa na horizontal e na vertical, inclusive navios que se tocam', () => {
    const estado = tabuleiro();
    assert.equal(estado.largura, 10);
    assert.equal(estado.altura, 10);
    assert.deepEqual(estado.frota, frota);
    assert.deepEqual(estado.tiros, []);
});

test('BN02 rejeita frota incompleta, navio repetido ou tamanho incorreto', () => {
    assert.throws(() => criarTabuleiro(frota.slice(0, 3)), RangeError);
    assert.throws(() => criarTabuleiro([...frota, structuredClone(frota[3])]), RangeError);
    assert.throws(() => criarTabuleiro(comDestroier([[7, 9]])), RangeError);
});

test('BN03 rejeita diagonal, lacuna, sobreposição e navio fora do tabuleiro', () => {
    for (const casas of [
        [[6, 6], [7, 7]],
        [[6, 5], [6, 7]],
        [[9, 6], [9, 7]],
        [[8, 10], [9, 10]],
    ]) {
        assert.throws(() => criarTabuleiro(comDestroier(casas)), RangeError);
    }
});

test('BN04 diferencia água e acerto e registra ambos os tiros', () => {
    const agua = atirar(tabuleiro(), [5, 5]);
    assert.equal(agua.resultado, 'agua');
    assert.deepEqual(agua.estado.tiros, [[5, 5]]);

    const acerto = atirar(agua.estado, [0, 0]);
    assert.equal(acerto.resultado, 'acerto');
    assert.deepEqual(acerto.estado.tiros, [[5, 5], [0, 0]]);
});

test('BN05 rejeita tiro fora do tabuleiro', () => {
    assert.throws(() => atirar(tabuleiro(), [10, 0]), RangeError);
    assert.throws(() => atirar(tabuleiro(), [0, -1]), RangeError);
});

test('BN06 tiro repetido não conta como acerto novo nem afunda o navio', () => {
    const primeiro = atirar(tabuleiro(), [7, 9]);
    assert.equal(primeiro.resultado, 'acerto');

    const repetido = atirar(primeiro.estado, [7, 9]);
    assert.equal(repetido.resultado, 'repetido');
    assert.deepEqual(repetido.estado.tiros, [[7, 9]]);

    const segundo = atirar(repetido.estado, [8, 9]);
    assert.equal(segundo.resultado, 'afundou');
    assert.deepEqual(segundo.estado.tiros, [[7, 9], [8, 9]]);
});

test('BN07 vitória só acontece ao acertar a última casa da frota', () => {
    const casasDaFrota = frota.flatMap(navio => navio.casas);
    let estado = tabuleiro();
    for (const posicao of casasDaFrota.slice(0, -1)) {
        const tiro = atirar(estado, posicao);
        assert.ok(['acerto', 'afundou'].includes(tiro.resultado));
        estado = tiro.estado;
    }
    assert.equal(estado.tiros.length, 13);

    const ultimo = atirar(estado, casasDaFrota.at(-1));
    assert.equal(ultimo.resultado, 'vitoria');
    assert.deepEqual(ultimo.estado.tiros, casasDaFrota);
});
