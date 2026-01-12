const express = require('express');
const axios = require('axios');
const mysql = require('mysql2'); // Añadimos esto
const app = express();

app.use(express.urlencoded({ extended: true }));

// Configuración de la Base de Datos usando Variables de Entorno
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get('/', (req, res) => {
    res.send('<h1>Reserva Fisioterapia</h1><form action="/enviar" method="POST"><input name="nombre" placeholder="Nombre"><input name="telefono" placeholder="WhatsApp"><button>Reservar</button></form>');
});

app.post('/enviar', async (req, res) => {
    const { nombre, telefono } = req.body;

    // 1. Guardar en Base de Datos (Seguridad primero)
    const sql = 'INSERT INTO pacientes (nombre, telefono) VALUES (?, ?)';
    db.execute(sql, [nombre, telefono], async (err) => {
        if (err) return res.send("Error al guardar en base de datos.");

        // 2. Intentar enviar WhatsApp
        try {
            await axios.post(`https://graph.facebook.com/v18.0/${process.env.WA_PHONE_ID}/messages`, {
                messaging_product: "whatsapp",
                to: telefono,
                type: "template",
                template: { name: "hello_world", language: { code: "en_US" } }
            }, {
                headers: { 'Authorization': `Bearer ${process.env.WA_TOKEN}` }
            });
            res.send("Datos guardados y WhatsApp enviado.");
        } catch (error) {
            res.send("Datos guardados en sistema, pero hubo un error enviando el WhatsApp.");
        }
    });
});

app.listen(process.env.PORT || 3000);
