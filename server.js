const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.urlencoded({ extended: true }));

// 1. BASE DE DATOS (Escribe tu contraseña entre las comillas)
const db = mysql.createPool({
    host: '127.0.0.1', 
    user: 'u120456799_user', 
    password: 'Fisonia2026', 
    database: 'u120456799_fisonia',
    waitForConnections: true,
    connectionLimit: 10
});

// 2. FORMULARIO PRINCIPAL
app.get('/', (req, res) => {
    res.send(`
        <h1>Reserva de Fisioterapia</h1>
        <form action="/enviar" method="POST">
            <input name="nombre" placeholder="Nombre" required><br><br>
            <input name="telefono" placeholder="WhatsApp" required><br><br>
            <input type="date" name="fecha_cita" required><br><br>
            <input type="time" name="hora_cita" required><br><br>
            <button type="submit">Reservar Ahora</button>
        </form>
    `);
});

// 3. ENVÍO (Protegido para evitar el 503)
app.post('/enviar', (req, res) => {
    const { nombre, telefono, fecha_cita, hora_cita } = req.body;
    
    db.execute('INSERT INTO pacientes (nombre, telefono, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)', 
    [nombre, telefono, fecha_cita, hora_cita], (err) => {
        if (err) return res.send("Error en la DB: " + err.message);

        // SOLO si tienes la clave del correo se enviará, si no, solo dirá "Éxito"
        res.send("<h2>¡Registro completado con éxito!</h2><a href='/'>Volver</a>");
    });
});

app.listen(process.env.PORT || 3000);
