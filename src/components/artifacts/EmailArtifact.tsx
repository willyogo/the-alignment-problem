export function EmailArtifact({ from, subject, body, timestamp }: { from: string; subject?: string; body: string; timestamp?: string }) {
  return (
    <div className="email-artifact my-8">
      <div className="email-header">
        <div><span className="text-[#888]">From: </span><span className="text-[#aaa]">{from}</span></div>
        {subject && <div className="mt-1"><span className="text-[#888]">Subject: </span><span className="text-[#aaa]">{subject}</span></div>}
        {timestamp && <div className="mt-1 text-[10px] text-[#555]">{timestamp}</div>}
      </div>
      <div className="email-body whitespace-pre-wrap">{body}</div>
    </div>
  );
}
