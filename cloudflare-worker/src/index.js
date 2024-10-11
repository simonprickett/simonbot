import { AutoRouter } from 'itty-router';
import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import { SIMONBOT_COMMAND } from './commands.js';

class JsonResponse extends Response {
  constructor (body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    };

    super(jsonBody, init);
  }
}

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

const router = AutoRouter();

router.get('/', (request, env) => {
  return new Response(`Hello from simonbot ${env.DISCORD_APPLICATION_ID}.`);
});

router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(request, env);

  if (! isValid || ! interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    return new JsonResponse({
      type: InteractionResponseType.PONG
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    switch (interaction.data.name.toLowerCase()) {
      case SIMONBOT_COMMAND.name.toLowerCase(): {
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "You have summoned simonbot!"
          }
        });
      }

      default:
        return new JsonResponse({ error: 'Unknown type.' }, { status: 400 });
    }
  }

  return new JsonResponse({ error: 'Unknown type.'}, { status: 400 });
});

router.all('*', () => new Response('Not found.', { status: 404 }));

const server = {
  verifyDiscordRequest,
  fetch: router.fetch
};

export default { ...server }; // Destructured due to bug in Wrangler.