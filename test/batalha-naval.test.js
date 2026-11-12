import { test, expect } from '@jest/globals';
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
    expect(estado.largura).toBe(10);
    expect(estado.altura).toBe(10);
    expect(estado.frota).toEqual(frota);
    expect(estado.tiros).toEqual([]);
});

test('BN02 rejeita frota incompleta, navio repetido ou tamanho incorreto', () => {
    expect(() => criarTabuleiro(frota.slice(0, 3))).toThrow(RangeError);
    expect(() => criarTabuleiro([...frota, structuredClone(frota[3])])).toThrow(RangeError);
    expect(() => criarTabuleiro(comDestroier([[7, 9]]))).toThrow(RangeError);
});

test('BN03 rejeita diagonal, lacuna, sobreposição e navio fora do tabuleiro', () => {
    for (const casas of [
        [[6, 6], [7, 7]],
        [[6, 5], [6, 7]],
        [[9, 6], [9, 7]],
        [[8, 10], [9, 10]],
    ]) {
        expect(() => criarTabuleiro(comDestroier(casas))).toThrow(RangeError);
    }
});

test('BN04 diferencia água e acerto e registra ambos os tiros', () => {
    const agua = atirar(tabuleiro(), [5, 5]);
    expect(agua.resultado).toBe('agua');
    expect(agua.estado.tiros).toEqual([[5, 5]]);

    const acerto = atirar(agua.estado, [0, 0]);
    expect(acerto.resultado).toBe('acerto');
    expect(acerto.estado.tiros).toEqual([[5, 5], [0, 0]]);
});

test('BN05 rejeita tiro fora do tabuleiro', () => {
    expect(() => atirar(tabuleiro(), [10, 0])).toThrow(RangeError);
    expect(() => atirar(tabuleiro(), [0, -1])).toThrow(RangeError);
});

test('BN06 tiro repetido não conta como acerto novo nem afunda o navio', () => {
    const primeiro = atirar(tabuleiro(), [7, 9]);
    expect(primeiro.resultado).toBe('acerto');

    const repetido = atirar(primeiro.estado, [7, 9]);
    expect(repetido.resultado).toBe('repetido');
    expect(repetido.estado.tiros).toEqual([[7, 9]]);

    const segundo = atirar(repetido.estado, [8, 9]);
    expect(segundo.resultado).toBe('afundou');
    expect(segundo.estado.tiros).toEqual([[7, 9], [8, 9]]);
});

test('BN07 vitória só acontece ao acertar a última casa da frota', () => {
    const casasDaFrota = frota.flatMap(navio => navio.casas);
    let estado = tabuleiro();
    for (const posicao of casasDaFrota.slice(0, -1)) {
        const tiro = atirar(estado, posicao);
        expect(['acerto', 'afundou'].includes(tiro.resultado)).toBeTruthy();
        estado = tiro.estado;
    }
    expect(estado.tiros.length).toBe(13);

    const ultimo = atirar(estado, casasDaFrota.at(-1));
    expect(ultimo.resultado).toBe('vitoria');
    expect(ultimo.estado.tiros).toEqual(casasDaFrota);
});

test('BN08 rejeita tipo desconhecido, casa repetida no mesmo navio e coordenadas fracionárias', () => {
    expect(() => criarTabuleiro([...frota.slice(0, 3), { tipo: 'fragata', casas: [[7, 9], [8, 9]] }])).toThrow(RangeError);
    expect(() => criarTabuleiro(comDestroier([[7, 9], [7, 9]]))).toThrow(RangeError);
    expect(() => criarTabuleiro(comDestroier([[7.5, 9], [8.5, 9]]))).toThrow(RangeError);
    expect(() => atirar(tabuleiro(), [0.5, 0])).toThrow(RangeError);
    expect(() => atirar(tabuleiro(), [0, 2.5])).toThrow(RangeError);
});

test('BN09 afunda um navio maior somente no último acerto de suas casas', () => {
    let estado = tabuleiro();
    for (const posicao of frota[0].casas.slice(0, -1)) {
        const tiro = atirar(estado, posicao);
        expect(tiro.resultado).toBe('acerto');
        estado = tiro.estado;
    }
    const ultimo = atirar(estado, frota[0].casas.at(-1));
    expect(ultimo.resultado).toBe('afundou');
    expect(ultimo.estado.tiros).toEqual(frota[0].casas);
});
