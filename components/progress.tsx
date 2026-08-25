export function StackProgress({ count }: { count: number }) {
  const active = Math.min(8, Math.max(0, count));
  return (
    <div className="progress" role="img" aria-label={`${count} consecutive periods`}>
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index} className={index < active ? 'on' : ''} />
      ))}
    </div>
  );
}
