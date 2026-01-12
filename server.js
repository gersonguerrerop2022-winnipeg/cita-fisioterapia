// PON ESTO AL PRINCIPIO DE TODO EN server.js
process.on('uncaughtException', (err) => {
    console.error('¡CRASH DETECTADO!: ', err.message);
});

const express = require('express');
// ... resto de tu código ...
const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.urlencoded({ extended: true }));

// 1. BASE DE DATOS (Mantenemos tu configuración que funcionaba)
const db = mysql.createPool({
    host: '127.0.0.1', 
    user: 'u120456799_user', 
    password: 'Fisonia2026', 
    database: 'u120456799_fisonia',
    connectTimeout: 10000
});

// 2. CONFIGURACIÓN DE CORREO (Protegida)
let transporter;
try {
    transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true, 
        auth: {
            user: 'citas@fisio.guerrerogroup.net', 
            pass: 'Fisonia2026@!' 
        }
    });
} catch (e) {
    console.error("Error inicializando transporter:", e);
}

// RUTA PRINCIPAL (GET)
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; padding:20px;">
            <h1>Reserva de Fisioterapia</h1>
            <form action="/enviar" method="POST">
                <input name="nombre" placeholder="Nombre" required><br><br>
                <input name="telefono" placeholder="WhatsApp" required><br><br>
                <input type="date" name="fecha_cita" required><br><br>
                <input type="time" name="hora_cita" required><br><br>
                <button type="submit">Reservar Ahora</button>
            </form>
        </body>
    `);
});

// RUTA DE ENVÍO (POST)
app.post('/enviar', (req, res) => {
    const { nombre, telefono, fecha_cita, hora_cita } = req.body;
    
    // Primero guardamos en DB
    db.execute('INSERT INTO pacientes (nombre, telefono, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)', 
    [nombre, telefono, fecha_cita, hora_cita], (err) => {
        if (err) return res.status(500).send("Error en Base de Datos: " + err.message);

        // Si guardó en DB, intentamos enviar el mail (pero no bloqueamos si falla)
        if (transporter) {
            const mailOptions = {
                from: 'reservas@guerrerogroup.net',
                to: 'fisio@guerrerogroup.net',
                subject: '¡Nueva Cita! - ' + nombre,
                text: \`Nueva cita registrada: \${nombre} para el \${fecha_cita} a las \${hora_cita}.\`
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) console.log("El email falló, pero el registro en DB fue exitoso.");
            });
        }

        res.send("<h2>¡Registro exitoso!</h2><p>Los datos están guardados.</p><a href='/'>Volver</a>");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo en puerto " + PORT));
