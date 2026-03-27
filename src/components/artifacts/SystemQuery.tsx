export function SystemQuery({ command, response }: { command: string; response?: string }) {
  return (<div className="crt-terminal my-8"><div className="crt-glow font-mono text-sm"><span className="text-green-800">&gt; </span>{command}</div>{response && <div className="font-mono text-sm text-green-400 opacity-80 mt-2 whitespace-pre-wrap">{response}</div>}</div>);
}
