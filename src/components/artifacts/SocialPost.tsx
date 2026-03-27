export function SocialPost({ text, caption }: { text: string; caption: string }) {
  return (<div className="social-post-card my-8"><div className="text-sm text-[#aaa] font-sans mb-3">{text}</div><div className="text-xs text-[#666] font-sans italic">{caption}</div></div>);
}
