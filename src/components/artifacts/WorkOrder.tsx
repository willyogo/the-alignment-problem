export function WorkOrder({ recipient, content }: { recipient: string; content: string }) {
  return (<div className="work-order my-8 rounded"><div className="work-order-header">Automated Work Order</div><div className="text-[#666] mb-2"><span className="text-[#555]">To: </span>{recipient}</div><div className="text-[#aaa] whitespace-pre-wrap leading-relaxed">{content}</div></div>);
}
