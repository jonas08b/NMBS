const { google } = require('googleapis');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { summary, description, startTime, endTime, date } = req.body;

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const [year, month, day] = date.split('-').map(Number);
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  const event = {
    summary: summary,
    description: description,
    start: {
      dateTime: new Date(year, month-1, day, sh, sm).toISOString(),
      timeZone: 'Europe/Brussels'
    },
    end: {
      dateTime: new Date(year, month-1, day, eh, em).toISOString(),
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
    res.status(200).json({ success: true, eventId: result.data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
