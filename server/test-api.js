fetch('http://localhost:3001/api/dashboard')
  .then(res => res.json())
  .then(data => {
    console.log('--- RESPOSTA API DASHBOARD ---');
    console.log('Obra:', data.obra.centro_custo, '-', data.obra.nome_obra);
    console.log('Total Recebido (m³):', data.resumo.total_recebido_m3);
    console.log('Brita 19 (m³):', data.resumo.brita19.recebido_m3);
    console.log('Brita 12 (m³):', data.resumo.brita12.recebido_m3);
    console.log('Pó de Pedra (m³):', data.resumo.po_pedra.recebido_m3);
    console.log('Estoque Total Agregados (m³):', data.resumo.estoque_total_m3);
    console.log('CBUQ Máximo com Estoque Atual (m³):', data.respostas_engenheiro.producao_maxima_cbuq_estoque_m3);
    console.log('Material Limitante:', data.respostas_engenheiro.material_limitante);
    console.log('Alertas:', data.alertas);
  })
  .catch(err => console.error('Erro na requisição:', err));
