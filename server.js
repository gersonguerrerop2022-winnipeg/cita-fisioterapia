const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.urlencoded({ extended: true }));

// Formulario simple
app.get('/', (req, res) => {
    res.send(`
        <h1>Reserva de Fisioterapia</h1>
        <form action="/enviar" method="POST">
            <input type="text" name="nombre" placeholder="Nombre" required><br><br>
            <input type="text" name="telefono" placeholder="WhatsApp (Ej: 521...)" required><br><br>
            <button type="submit">Confirmar Cita</button>
        </form>
    `);
});

// Envío de WhatsApp (Usando Meta Cloud API)
app.post('/enviar', async (req, res) => {
    const { nombre, telefono } = req.body;

    try {
        await axios.post(`https://graph.facebook.com/v18.0/TU_ID_TELEFONO/messages`, {
            messaging_product: "whatsapp",
            to: telefono,
            type: "template",
            template: { name: "hello_world", language: { code: "en_US" } }
        }, {
            headers: { 'Authorization': `Bearer TU_TOKEN_DE_META` }
        });
        res.send("¡Cita confirmada! El paciente recibió su WhatsApp.");
    } catch (error) {
        res.send("Recibimos los datos, pero hubo un error con WhatsApp.");
    }
});

app.listen(process.env.PORT || 3000);
