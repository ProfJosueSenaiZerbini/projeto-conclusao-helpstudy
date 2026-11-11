// =====================================================================
// Aulas de estudo (conteúdo que vem antes das 10 questões de cada matéria)
// Cada arquivo desta pasta tem as aulas de uma matéria. O servidor coloca
// tudo no banco sozinho ao iniciar (config/migracoes.js).
// =====================================================================
const MATERIAS = [
    'matematica', 'portugues', 'historia', 'geografia', 'quimica',
    'fisica', 'biologia', 'ingles', 'filosofia', 'sociologia'
];

// Lista com todas as aulas: { slug, ordem, titulo, descricao, minutos, conteudo }
const AULAS = MATERIAS.flatMap((slug) =>
    require(`./${slug}`).map(({ ordem, titulo, descricao, minutos, ...conteudo }) => ({
        slug, ordem, titulo, descricao, minutos, conteudo
    }))
);

module.exports = { AULAS };
