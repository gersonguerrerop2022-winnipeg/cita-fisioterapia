const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.urlencoded({ extended: true }));

// 1. BASE DE DATOS (Asegúrate de poner tu contraseña real aquí)
const db = mysql.createPool({
    host: '127.0.0.1', 
    user: 'u120456799_user', 
    password: 'Fisonia2026', 
    database: 'u120456799_fisonia',
    waitForConnections: true,
    connectionLimit: 10
});

// 2. CONFIGURACIÓN DE CORREO (Protegida)
let transporter;
try {
    transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true, 
        auth: {
            user: 'citas@fisio.guerrerogroup.net', // La que creaste en el panel
            pass: 'Fisonia2026@!'   // La que anotaste al crearla
        }
    });
} catch (e) {
    console.error("Error inicializando el correo:", e.message);
}

// 3. PÁGINA PRINCIPAL
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; padding:20px; text-align:center;">
            <h1>Reserva de Fisioterapia</h1>
            <form action="/enviar" method="POST" style="display:inline-block; text-align:left;">
                <label>Nombre:</label><br><input name="nombre" required><br><br>
                <label>WhatsApp:</label><br><input name="telefono" required><br><br>
                <label>Día:</label><br><input type="date" name="fecha_cita" required><br><br>
                <label>Hora:</label><br><input type="time" name="hora_cita" required><br><br>
                <button type="submit" style="background:#673ab7; color:white; padding:10px 20px;">Reservar Ahora</button>
            </form>
        </body>
    `);
});

// 4. GUARDAR Y NOTIFICAR
app.post('/enviar', (req, res) => {
    const { nombre, telefono, fecha_cita, hora_cita } = req.body;
    
    db.execute('INSERT INTO pacientes (nombre, telefono, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)', 
    [nombre, telefono, fecha_cita, hora_cita], (err) => {
        if (err) return res.status(500).send("Error en la Base de Datos.");

        // Intentar enviar el aviso sin bloquear la web
        if (transporter) {
            transporter.sendMail({
                from: '"Citas Fisio" <reservas@guerrerogroup.net>',
                to: 'fisio@guerrerogroup.net',
                subject: 'Nueva Cita: ' + nombre,
                text: \`Nueva cita: \${nombre} el \${fecha_cita} a las \${hora_cita}. WhatsApp: \${telefono}\`
            }, (error) => {
                if (error) console.log("Aviso: El correo no se envió, pero el dato se guardó.");
            });
        }

        res.send("<h2>¡Registro completado!</h2><p>Te esperamos el " + fecha_cita + ".</p><a href='/'>Volver</a>");
    });
});

app.listen(process.env.PORT || 3000);
