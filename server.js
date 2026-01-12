const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.urlencoded({ extended: true }));

// CONEXIÓN DIRECTA (Para evitar errores de variables de entorno)
const db = mysql.createPool({
    host: '127.0.0.1', 
    user: 'u120456799_user', // Tu usuario de la imagen da92dd
    password: 'Fisonia2026', // Escribe aquí la clave que creaste en el panel
    database: 'u120456799_fisonia',
    connectTimeout: 10000
});

// 1. Formulario Actualizado
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; padding:40px; background:#f4f4f9;">
            <div style="max-width:400px; margin:auto; background:white; padding:20px; border-radius:10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color:#673ab7;">Reserva de Fisioterapia</h1>
                <form action="/enviar" method="POST">
                    <label>Nombre:</label><br><input name="nombre" style="width:100%; padding:10px;" required><br><br>
                    <label>WhatsApp:</label><br><input name="telefono" style="width:100%; padding:10px;" placeholder="Ej: 34600..." required><br><br>
                    <label>Día de la Cita:</label><br><input type="date" name="fecha_cita" style="width:100%; padding:10px;" required><br><br>
                    <label>Hora de la Cita:</label><br><input type="time" name="hora_cita" style="width:100%; padding:10px;" required><br><br>
                    <button type="submit" style="background:#673ab7; color:white; width:100%; padding:12px; border:none; border-radius:5px; cursor:pointer;">Reservar Ahora</button>
                </form>
            </div>
        </body>
    `);
});

// 2. Guardar con Día y Hora
app.post('/enviar', (req, res) => {
    const { nombre, telefono, fecha_cita, hora_cita } = req.body;
    const sql = 'INSERT INTO pacientes (nombre, telefono, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)';
    
    db.execute(sql, [nombre, telefono, fecha_cita, hora_cita], (err) => {
        if (err) return res.status(500).send("Error de conexión: " + err.message);
        res.send("<h2 style='color:green;'>¡Reserva confirmada!</h2><p>Te esperamos el " + fecha_cita + " a las " + hora_cita + ".</p><a href='/'>Nueva reserva</a>");
    });
});

// 3. Agenda privada para la fisioterapeuta
app.get('/agenda-2026', (req, res) => {
    db.execute('SELECT * FROM pacientes ORDER BY fecha_cita ASC, hora_cita ASC', (err, results) => {
        if (err) return res.send("Error al leer agenda: " + err.message);
        let html = '<h1>Agenda Cronológica</h1><table border="1" style="width:100%; border-collapse:collapse;">';
        html += '<tr style="background:#673ab7; color:white;"><th>Día</th><th>Hora</th><th>Paciente</th><th>WhatsApp</th></tr>';
        results.forEach(p => {
            html += `<tr>
                <td style="padding:10px;">${p.fecha_cita}</td>
                <td style="padding:10px;">${p.hora_cita}</td>
                <td style="padding:10px;">${p.nombre}</td>
                <td style="padding:10px;"><a href="https://wa.me/${p.telefono}">Chatear</a></td>
            </tr>`;
        });
        res.send(html + '</table>');
    });
});

app.listen(process.env.PORT || 3000);
