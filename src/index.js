require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();

// Middleware para parsear JSON
app.use(bodyParser.json());

// Endpoint para recibir webhooks de HubSpot
app.post('/webhooks/hubspot', async (req, res) => {
  const hubspotData = req.body;
  console.log(hubspotData);
  // Asegúrate de validar el contenido del webhook
  if (!hubspotData) {
    return res.status(400).send('Datos no válidos');
  }

  const { nombre_empresa } = hubspotData.nombre_empresa;
  const { dominio_empresa } = hubspotData.dominio_empresa;

  // Lógica para enviar datos a la API de Asana
  try {
    const asanaResponse = await axios.post(
      'https://app.asana.com/api/1.0/tasks',
      {
        data: {
          name: `Tarea para: ${nombre_empresa}`,
          notes: `Revisar esta tarea este el dominio: ${dominio_empresa}`,
          projects: [`${process.env.ASANA_PROJECT_ID}`], // ID del proyecto en Asana
          workspace: "1208820907061445"
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ASANA_PERSONAL_ACCESS_TOKEN}`,
        },
      }
    );

    console.log('Proyecto creado en Asana:', asanaResponse.data);
    res.status(200).send('Webhook procesado correctamente');
  } catch (error) {
    console.error('Error al enviar datos a Asana:', error.response?.data || error.message);
    res.status(500).send('Error al procesar el webhook');
  }
});

// Servidor en ejecución
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});