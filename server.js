const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.urlencoded({ extended: true }));

// Conexión con valores directos (Hardcoded) para asegurar el éxito
const db = mysql.createPool({
    host: '127.0.0.1', // Cambiamos localhost por esta IP exacta
    user: 'u120456799_u123456789_cit', 
    password: 'u123456789Pass', // ASEGÚRATE de que esta sea la clave exacta que pusiste en el panel
    database: 'u120456799_u123456789_cit',
    connectTimeout: 10000
});

app.get('/', (req, res) => {
    res.send('<h1>Reserva Fisioterapia</h1><form action="/enviar" method="POST"><input name="nombre" placeholder="Nombre" required><br><br><input name="telefono" placeholder="WhatsApp" required><br><br><button type="submit">Reservar</button></form>');
});

app.post('/enviar', (req, res) => {
    const { nombre, telefono } = req.body;
    db.execute('INSERT INTO pacientes (nombre, telefono) VALUES (?, ?)', [nombre, telefono], (err) => {
        if (err) {
            return res.status(500).send("DETALLE DEL ERROR: " + err.code + " - " + err.message);
        }
        res.send("¡Victoria! Datos guardados en la base de datos.");
    });
});

app.listen(process.env.PORT || 3000);
