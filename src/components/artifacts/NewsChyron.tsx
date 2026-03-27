export function NewsChyron({ network, text }: { network: string; text: string }) {
  return (<div className="news-chyron my-8"><div className="network-badge">{network}</div><div className="pl-14">{text}</div></div>);
}
