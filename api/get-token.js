import { google } from 'googleapis';

export default function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://nmbs-sepia.vercel.app/api/get-token'
  );

  if (req.query.code) {
    oauth2Client.getToken(req.query.code, (err, token) => {
      if (err) return res.send('Fout: ' + err.message);
      res.send(`
        <h2>Jouw Refresh Token:</h2>
        <code style="font-size:1.2rem">${token.refresh_token}</code>
        <p>Kopieer dit en zet het in Vercel als GOOGLE_REFRESH_TOKEN</p>
      `);
    });
  } else {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent'
    });
    res.redirect(url);
  }
}
