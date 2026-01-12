const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.urlencoded({ extended: true }));

// 1. BASE DE DATOS (Mantenemos tu conexión exitosa)
const db = mysql.createPool({
    host: '127.0.0.1', 
    user: 'u120456799_user', 
    password: 'Fisonia2026', 
    database: 'u120456799_fisonia'
});

// 2. FORMULARIO
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; padding:40px; background:#f4f4f9; text-align:center;">
            <div style="max-width:400px; margin:auto; background:white; padding:30px; border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                <h2 style="color:#673ab7;">Reserva tu Cita</h2>
                <form action="/enviar" method="POST">
                    <input name="nombre" placeholder="Tu Nombre completo" style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:5px;" required><br>
                    <input name="telefono" placeholder="Tu WhatsApp (ej: 34600...)" style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:5px;" required><br>
                    <input type="date" name="fecha_cita" style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:5px;" required><br>
                    <input type="time" name="hora_cita" style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:5px;" required><br>
                    <button type="submit" style="background:#673ab7; color:white; width:100%; padding:15px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">RESERVAR Y NOTIFICAR</button>
                </form>
            </div>
        </body>
    `);
});

// 3. PROCESAMIENTO Y REDIRECCIÓN
app.post('/enviar', (req, res) => {
    const { nombre, telefono, fecha_cita, hora_cita } = req.body;
    const sql = 'INSERT INTO pacientes (nombre, telefono, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)';
    
    db.execute(sql, [nombre, telefono, fecha_cita, hora_cita], (err) => {
        if (err) return res.status(500).send("Error crítico: " + err.message);

        // CREAR EL MENSAJE PARA LA FISIO (Ajusta el número de teléfono aquí abajo)
        const numFisio = "34600000000"; // PON AQUÍ EL WHATSAPP DE LA FISIOTERAPEUTA
        const texto = `¡Hola! Soy ${nombre}. Acabo de reservar una cita para el día ${fecha_cita} a las ${hora_cita}. Mi contacto es ${telefono}.`;
        const linkWA = `https://wa.me/${12049005435}?text=${encodeURIComponent(texto)}`;

        // RESPUESTA FINAL: El paciente confirma con un clic
        res.send(`
            <body style="font-family:sans-serif; text-align:center; padding:50px;">
                <h2 style="color:green;">✔ Datos guardados correctamente</h2>
                <p>Para finalizar, haz clic en el botón de abajo para enviar el aviso a la clínica por WhatsApp:</p>
                <br>
                <a href="${linkWA}" style="background:#25d366; color:white; padding:20px 40px; text-decoration:none; border-radius:50px; font-weight:bold; font-size:1.2em; display:inline-block; box-shadow:0 4px 15px rgba(37,211,102,0.4);">
                    ENVIAR AVISO POR WHATSAPP
                </a>
                <br><br>
                <a href="/" style="color:#666; text-decoration:none;">← Volver</a>
            </body>
        `);
    });
});

app.listen(process.env.PORT || 3000);
