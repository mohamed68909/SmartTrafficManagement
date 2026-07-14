import React, { useState, useEffect } from 'react';

const LiveClock = () => {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('ar-EG'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
      {clock}
    </span>
  );
};

export default React.memo(LiveClock);
