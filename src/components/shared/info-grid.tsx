interface InfoItem {
  label: string;
  value: string;
}

export function InfoGrid({ items }: { items: InfoItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
