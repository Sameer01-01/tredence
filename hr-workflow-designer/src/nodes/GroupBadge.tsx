// Shared component: renders a coloured group label badge on a node
export const GroupBadge = ({ data }: { data: any }) => {
  if (!data.groupLabel) return null;
  return (
    <div style={{
      position: 'absolute',
      top: '-20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: data.groupColor || '#6366f1',
      color: '#fff',
      fontSize: '10px',
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: '999px',
      whiteSpace: 'nowrap',
      letterSpacing: '0.5px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      pointerEvents: 'none',
    }}>
      {data.groupLabel}
    </div>
  );
};
