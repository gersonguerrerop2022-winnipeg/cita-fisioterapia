const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.urlencoded({ extended: true }));

// Forzamos la lectura de variables y añadimos valores por defecto para pruebas
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'u120456799_u123456789_cit', // Pon aquí el usuario de tu imagen d8676e
    password: process.env.DB_PASSWORD || 'u123456789Pass',     // Pon aquí tu contraseña real
    database: process.env.DB_NAME || 'u120456799_u123456789_cit',
    connectTimeout: 10000
});

// ESTO ASEGURA QUE EL FORMULARIO CARGUE SIEMPRE (Ruta GET)
app.get('/', (req, res) => {
    res.send(`
        <h1>Reserva Fisioterapia</h1>
        <form action="/enviar" method="POST">
            <input name="nombre" placeholder="Nombre" required><br><br>
            <input name="telefono" placeholder="WhatsApp" required><br><br>
            <button type="submit">Reservar</button>
        </form>
    `);
});

// Ruta de procesamiento (POST)
app.post('/enviar', (req, res) => {
    const { nombre, telefono } = req.body;
    
    // Intentamos la inserción
    db.execute('INSERT INTO pacientes (nombre, telefono) VALUES (?, ?)', [nombre, telefono], (err) => {
        if (err) {
    // Esto imprimirá el error real en tu pantalla para que lo leas
    return res.status(500).send("DETALLE DEL ERROR: " + err.code + " - " + err.message);
}
        res.send("¡Gracias! Datos guardados correctamente.");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor activo en puerto " + PORT));
