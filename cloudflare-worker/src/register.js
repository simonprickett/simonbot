import { SIMONBOT_COMMAND } from "./commands.js";
import 'dotenv/config';

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (! token) {
  throw new Error('DISCORD_TOKEN is a required environment variable!');
}

if (! applicationId) {
  throw new Error('DISCORD_APPLICATION_ID is a required environment variable!');
}

const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;

const response = await fetch(
  url,
  {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`
    },
    method: 'PUT',
    body: JSON.stringify([ SIMONBOT_COMMAND ])
  }
);

if (response.ok) {
  console.log('Registered commands.');
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
} else {
  let errorText = `Error registering commands \n ${response.url}: ${response.status} ${response.statusText}`;

  try {
    const error = await response.text();
    if (error) {
      errorText = `${errorText} \n\n ${error}`;
    }
  } catch (err) {
    console.error('Error reading body from request:', err);
  }
  console.error(errorText);
}