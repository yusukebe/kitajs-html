export function ManyComponents(name: string) {
  return (
    <div>
      {Array.from({ length: 5000 }, (_, i) => (
        <div key={i}>{i + ''}</div>
      ))}
    </div>
  );
}
