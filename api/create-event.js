const { google } = require('googleapis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { datum, vertrektijd, trein, van, naar } = req.body;

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const [year, month, day] = datum.split('-').map(Number);
  const [sh, sm] = vertrektijd.split(':').map(Number);

  // Event duurt 1 uur (tot aankomst op station)
  const start = new Date(year, month-1, day, sh, sm);
  const end   = new Date(year, month-1, day, sh, sm + 60);

  const event = {
    summary: `🚂 Jonas vertrekt — ${vertrektijd}`,
    description: `Vertrek van thuis om ${vertrektijd}\nTrein: ${trein}\n${van} → ${naar}`,
    start: {
      dateTime: start.toISOString(),
      timeZone: 'Europe/Brussels'
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: 'Europe/Brussels'
    },
    attendees: [
      { email: process.env.PAPA_EMAIL }
    ],
    sendUpdates: 'all'
  };

  try {
    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendNotifications: true
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
