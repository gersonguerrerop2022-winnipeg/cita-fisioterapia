const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.urlencoded({ extended: true }));

// 1. CONEXIÓN A BASE DE DATOS (Pon tu contraseña real)
const db = mysql.createPool({
    host: '127.0.0.1', 
    user: 'u120456799_user', 
    password: 'Fisonia2026', 
    database: 'u120456799_fisonia',
    waitForConnections: true,
    connectionLimit: 10
});

// 2. CONFIGURACIÓN DEL CORREO (SMTP Hostinger)
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'citas@fisio.guerrerogroup.net',
        pass: 'Fisonia2026@!' // La que creaste para esta cuenta
    }
});

// 3. PÁGINA DEL FORMULARIO
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; padding:40px; background:#f4f4f9;">
            <div style="max-width:400px; margin:auto; background:white; padding:20px; border-radius:10px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color:#673ab7;">Reserva de Fisioterapia</h1>
                <form action="/enviar" method="POST">
                    <label>Nombre del Paciente:</label><br>
                    <input name="nombre" style="width:100%; padding:10px; margin:10px 0;" required><br>
                    <label>Teléfono (WhatsApp):</label><br>
                    <input name="telefono" style="width:100%; padding:10px; margin:10px 0;" required><br>
                    <label>Fecha de Cita:</label><br>
                    <input type="date" name="fecha_cita" style="width:100%; padding:10px; margin:10px 0;" required><br>
                    <label>Hora:</label><br>
                    <input type="time" name="hora_cita" style="width:100%; padding:10px; margin:10px 0;" required><br>
                    <button type="submit" style="background:#673ab7; color:white; width:100%; padding:12px; border:none; border-radius:5px; cursor:pointer;">Confirmar Cita</button>
                </form>
            </div>
        </body>
    `);
});

// 4. GUARDAR EN DB Y ENVIAR CORREO
app.post('/enviar', (req, res) => {
    const { nombre, telefono, fecha_cita, hora_cita } = req.body;
    const sql = 'INSERT INTO pacientes (nombre, telefono, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)';
    
    db.execute(sql, [nombre, telefono, fecha_cita, hora_cita], (err) => {
        if (err) return res.status(500).send("Error en la Base de Datos: " + err.message);

        // Bloque de envío de correo (Protegido para no romper la web si falla)
        const mailOptions = {
            from: '"Sistema de Citas" <citas@fisio.guerrerogroup.net>',
            to: 'fisio@guerrerogroup.net', // Donde quieres que llegue el aviso
            subject: '¡Nueva Cita! - ' + nombre,
            html: \`
                <h3>Nueva cita registrada</h3>
                <p><b>Paciente:</b> \${nombre}</p>
                <p><b>WhatsApp:</b> \${telefono}</p>
                <p><b>Fecha:</b> \${fecha_cita}</p>
                <p><b>Hora:</b> \${hora_cita}</p>
                <hr>
                <a href="https://wa.me/\${telefono.replace(/\\s+/g, '')}" style="background:#25d366; color:white; padding:10px; text-decoration:none; border-radius:5px;">Escribir por WhatsApp</a>
            \`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) console.error("Error al enviar el aviso por email:", error.message);
        });

        // Respuesta inmediata al usuario (independiente del correo)
        res.send(\`
            <div style="text-align:center; padding:50px; font-family:sans-serif;">
                <h2 style="color:green;">¡Registro completado con éxito!</h2>
                <p>La cita para \${nombre} ha sido guardada.</p>
                <a href="/">Volver</a>
            </div>
        \`);
    });
});

app.listen(process.env.PORT || 3000);
