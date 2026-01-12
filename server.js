const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.urlencoded({ extended: true }));

const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// 1. Formulario con selectores de Fecha y Hora
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; padding:20px; max-width:400px; margin:auto;">
            <h1>Reserva de Fisioterapia</h1>
            <form action="/enviar" method="POST">
                <label>Nombre:</label><br><input name="nombre" style="width:100%" required><br><br>
                <label>WhatsApp:</label><br><input name="telefono" style="width:100%" required><br><br>
                <label>Día de la Cita:</label><br><input type="date" name="fecha_cita" style="width:100%" required><br><br>
                <label>Hora de la Cita:</label><br><input type="time" name="hora_cita" style="width:100%" required><br><br>
                <button type="submit" style="background:#673ab7; color:white; width:100%; padding:10px; border:none; border-radius:5px;">Reservar Ahora</button>
            </form>
        </body>
    `);
});

// 2. Guardar los 4 datos en la tabla 'pacientes'
app.post('/enviar', (req, res) => {
    const { nombre, telefono, fecha_cita, hora_cita } = req.body;
    const sql = 'INSERT INTO pacientes (nombre, telefono, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)';
    
    db.execute(sql, [nombre, telefono, fecha_cita, hora_cita], (err) => {
        if (err) return res.send("Error al guardar la cita: " + err.message);
        res.send("<h2>¡Cita agendada con éxito!</h2><p>Te esperamos el " + fecha_cita + " a las " + hora_cita + ".</p><a href='/'>Nueva reserva</a>");
    });
});

// 3. Agenda privada con orden cronológico
app.get('/ver-agenda-secreta-2026', (req, res) => {
    // Ordenamos por fecha y hora para que la primera cita del día salga arriba
    db.execute('SELECT * FROM pacientes ORDER BY fecha_cita ASC, hora_cita ASC', (err, results) => {
        if (err) return res.send("Error al leer agenda: " + err.message);
        
        let html = '<h1>Citas Programadas</h1><table border="1" style="width:100%; border-collapse:collapse;">';
        html += '<tr style="background:#eee;"><th>Paciente</th><th>Día</th><th>Hora</th><th>Acción</th></tr>';
        
        results.forEach(p => {
            html += `<tr>
                <td style="padding:10px">${p.nombre}</td>
                <td style="padding:10px">${p.fecha_cita}</td>
                <td style="padding:10px">${p.hora_cita}</td>
                <td style="padding:10px"><a href="https://wa.me/${p.telefono}" target="_blank">Contactar</a></td>
            </tr>`;
        });
        res.send(html + '</table>');
    });
});

app.listen(process.env.PORT || 3000);
