const USER_COLORS: Record<string, string> = { Gray: "#6B7B8B", Lucia: "#7B68EE", Pam: "#D4756E", Marcus: "#888888", default: "#555555" };
export function SlackArtifact({ messages }: { messages: Array<{ user: string; timestamp: string; text: string }> }) {
  return (
    <div className="my-8 bg-[#111] border border-[#222] rounded-lg py-2">
      {messages.map((msg, i) => {
        const color = USER_COLORS[msg.user] || USER_COLORS.default;
        return (
          <div key={i} className="slack-message">
            <div className="slack-avatar" style={{ background: color }}>{msg.user[0]}</div>
            <div>
              <div><span className="slack-username" style={{ color }}>{msg.user}</span><span className="slack-timestamp">{msg.timestamp}</span></div>
              <div className="slack-text">{msg.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
