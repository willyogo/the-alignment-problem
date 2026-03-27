const USER_COLORS: Record<string, string> = {
  gray: "#5B8FB9",
  lucia: "#9B6ED8",
  pam: "#D4756E",
  marcus: "#6BAF7D",
  janet: "#D4A24E",
  steph: "#D87B9E",
};

const DEFAULT_COLOR = "#555555";

function getUserColor(user: string): string {
  const lower = user.toLowerCase();
  for (const [name, color] of Object.entries(USER_COLORS)) {
    if (lower === name || lower.startsWith(name + " ") || lower.startsWith(name + ".")) {
      return color;
    }
  }
  return DEFAULT_COLOR;
}

function getDisplayName(user: string): string {
  // "lucia.ferreirasantos" → "Lucia"
  if (user.includes(".")) {
    return user.split(".")[0].charAt(0).toUpperCase() + user.split(".")[0].slice(1);
  }
  // "Lucia Ferreira-Santos" → "Lucia"
  return user.split(" ")[0];
}

function getInitial(user: string): string {
  return getDisplayName(user).charAt(0).toUpperCase();
}

export function SlackArtifact({ messages }: { messages: Array<{ user: string; timestamp: string; text: string }> }) {
  return (
    <div className="my-8 bg-[#111] border border-[#222] rounded-lg py-2">
      {messages.map((msg, i) => {
        const color = getUserColor(msg.user);
        const displayName = getDisplayName(msg.user);
        return (
          <div key={i} className="slack-message">
            <div className="slack-avatar" style={{ background: color }}>{getInitial(msg.user)}</div>
            <div>
              <div><span className="slack-username" style={{ color }}>{displayName}</span><span className="slack-timestamp">{msg.timestamp}</span></div>
              <div className="slack-text">{msg.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
