const { google } = require('googleapis');

module.exports = async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://nmbs-sepia.vercel.app/api/get-token'
  );

  if (req.query.code) {
    try {
      const { tokens } = await oauth2Client.getToken(req.query.code);
      res.send(`
        <h2>Jouw Refresh Token:</h2>
        <code style="word-break:break-all;font-size:1rem">${tokens.refresh_token}</code>
        <p>Kopieer dit en zet het in Vercel als GOOGLE_REFRESH_TOKEN</p>
      `);
    } catch(err) {
      res.send('Fout: ' + err.message);
    }
  } else {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent'
    });
    res.redirect(url);
  }
}
