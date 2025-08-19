import { useEffect, useState } from 'react';
import { Content, Header, Page } from '@backstage/core-components';

export const DoraDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dora/metrics')
      .then(res => res.json())
      .then(setMetrics)
      .catch(console.error);
  }, []);

  return (
    <Page themeId="tool">
      <Header title="DORA Metrics Dashboard" />
      <Content>
        {metrics ? (
          <pre>{JSON.stringify(metrics, null, 2)}</pre>
        ) : (
          <p>Loading...</p>
        )}
      </Content>
    </Page>
  );
};
