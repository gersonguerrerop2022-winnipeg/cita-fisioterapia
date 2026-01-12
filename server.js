const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer'); // Importamos la librería de correos
const app = express();
app.use(express.urlencoded({ extended: true }));

// 1. CONEXIÓN A BASE DE DATOS
const db = mysql.createPool({
    host: '127.0.0.1', 
    user: 'u120456799_user', 
    password: 'TU_CONTRASEÑA_DE_DB_AQUÍ', // La que ya pusiste y funciona
    database: 'u120456799_fisonia',
    connectTimeout: 10000
});

// 2. CONFIGURACIÓN DE CORREO (SMTP de Hostinger)
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'tu-correo@tu-dominio.com', // El que crees en el panel de Hostinger
        pass: 'tu-contraseña-de-email'   // La contraseña de ese correo
    }
});

// 3. FORMULARIO PRINCIPAL
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; padding:40px; background:#f4f4f9;">
            <div style="max-width:400px; margin:auto; background:white; padding:20px; border-radius:10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color:#673ab7;">Reserva Fisioterapia</h1>
                <form action="/enviar" method="POST">
                    <label>Nombre:</label><br><input name="nombre" style="width:100%; padding:10px;" required><br><br>
                    <label>WhatsApp:</label><br><input name="telefono" style="width:100%; padding:10px;" required><br><br>
                    <label>Día de la Cita:</label><br><input type="date" name="fecha_cita" style="width:100%; padding:10px;" required><br><br>
                    <label>Hora de la Cita:</label><br><input type="time" name="hora_cita" style="width:100%; padding:10px;" required><br><br>
                    <button type="submit" style="background:#673ab7; color:white; width:100%; padding:12px; border:none; border-radius:5px; cursor:pointer;">Reservar Ahora</button>
                </form>
            </div>
        </body>
    `);
});

// 4. GUARDAR Y ENVIAR AVISO
app.post('/enviar', (req, res) => {
    const { nombre, telefono, fecha_cita, hora_cita } = req.body;
    const sql = 'INSERT INTO pacientes (nombre, telefono, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)';
    
    db.execute(sql, [nombre, telefono, fecha_cita, hora_cita], (err) => {
        if (err) return res.status(500).send("Error DB: " + err.message);

        // Configuración del aviso por email
        const mailOptions = {
            from: 'Sistema de Reservas <fisio@guerrerogroup.net>',
            to: 'fisio@guerrerogroup.net', // Donde ella quiere recibir los avisos
            subject: 'Nueva Cita: ' + nombre,
            text: \`Nueva cita agendada:\\n\\nPaciente: \${nombre}\\nWhatsApp: \${telefono}\\nFecha: \${fecha_cita}\\nHora: \${hora_cita}\`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) console.log("Error de correo:", error);
            res.send("<h2>¡Registro exitoso y aviso enviado a la clínica!</h2><a href='/'>Volver</a>");
        });
    });
});

app.listen(process.env.PORT || 3000);
