const { google } = require('googleapis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { datum, vertrektijd, trein, van, naar, duurMinuten } = req.body;

  try {
    // Google OAuth
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const calendar = google.calendar({
      version: 'v3',
      auth
    });

    // Vertrektijd ontleden
    const [year, month, day] = datum.split('-').map(Number);
    const [hour, minute] = vertrektijd.split(':').map(Number);

    // Event duurt even lang als de reistijd van thuis naar het station
    const eind = new Date(year, month - 1, day, hour, minute);
    eind.setMinutes(eind.getMinutes() + (duurMinuten || 25));

    const eindtijd =
      `${String(eind.getHours()).padStart(2, '0')}:` +
      `${String(eind.getMinutes()).padStart(2, '0')}`;

    const event = {
      summary: `🚂 Afzetten Jonas station Mechelen`,
      description:
        `Vertrek van thuis om ${vertrektijd}\n` +
        `Trein: ${trein}\n` +
        `${van} → ${naar}`,

      start: {
        dateTime: `${datum}T${vertrektijd}:00`,
        timeZone: 'Europe/Brussels'
      },

      end: {
        dateTime: `${datum}T${eindtijd}:00`,
        timeZone: 'Europe/Brussels'
      },

      attendees: [
        {
          email: process.env.PAPA_EMAIL
        }
      ]
    };

    console.log(event.start);
    console.log(event.end);
    await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all'
    });

    return res.status(200).json({
      success: true,
      message: 'Kalenderafspraak aangemaakt'
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
