// Exemplo rápido de como deve ficar no seu Backend Express:
const sinesp = require('sinesp-api');

app.get('/:placa', async (req, res) => {
    try {
        const dados = await sinesp.search(req.params.placa);
        res.json(dados);
    } catch (err) {
        res.status(404).json({ error: 'Veículo não encontrado ou falha no Sinesp' });
    }
});